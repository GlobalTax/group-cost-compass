/**
 * Servicio de importación A3Nom
 * Orquesta el proceso completo de importación de costes desde archivos A3Nom
 */

import { supabase } from "@/integrations/supabase/client";
import type { A3NomParseResult } from "@/lib/parsers/a3nom/types";
import type { Database } from "@/integrations/supabase/types";
import {
  createEmployeeMap,
  identifyMissingEmployees,
  prepareEmployeesToCreate,
  updateEmployeeMapWithNew,
  validateCompaniesExist,
} from "./employeeMatchingService";
import {
  prepareCostsForInsertion,
  validateCostsForImport,
} from "./costsPreparationService";

type Company = Database['public']['Tables']['companies']['Row'];
type EmployeeInsert = Database['public']['Tables']['hr_employees']['Insert'];
type CostInsert = Database['public']['Tables']['hr_employee_costs']['Insert'];

interface EmployeeBasic {
  id: string;
  employee_code: string;
  company_id: string;
}

interface CompanyInfo {
  id: string;
  name: string;
  org_id: string;
}

export interface A3NomImportOptions {
  parseResult: A3NomParseResult;
  period: string;
  onProgress?: (current: number, total: number) => void;
  createEmployeesFn: (employees: EmployeeInsert[]) => Promise<EmployeeBasic[]>;
  bulkCreateCostsFn: (costs: CostInsert[]) => Promise<void>;
}

export interface A3NomImportResult {
  employeesCreated: number;
  costsImported: number;
  warnings: string[];
}

/**
 * Obtiene y mapea el catálogo de empresas
 */
async function fetchCompanyMap(): Promise<Map<string, CompanyInfo>> {
  const { data: companies, error } = await supabase
    .from("companies")
    .select("id, name, nif, org_id");

  if (error) throw error;

  if (!companies || companies.length === 0) {
    throw new Error("No se pudieron cargar las empresas del catálogo");
  }

  console.log("[A3Nom][Import] Empresas catálogo:", companies.length);
  
  return new Map(
    companies.map(c => [c.nif, { id: c.id, name: c.name, org_id: c.org_id }])
  );
}

/**
 * Obtiene empleados existentes y crea mapa con clave compuesta
 */
async function fetchEmployeeMap(employeeCodes: string[]): Promise<Map<string, string>> {
  const { data: employees, error } = await supabase
    .from("hr_employees")
    .select("id, employee_code, full_name, company_id")
    .in("employee_code", employeeCodes);

  if (error) throw error;

  console.log("[A3Nom][Import] Códigos en archivo:", employeeCodes.length);
  console.log("[A3Nom][Import] Empleados existentes:", employees?.length || 0);

  return createEmployeeMap(employees || []);
}

/**
 * Verifica si existen costes para el período y solicita confirmación
 */
async function checkExistingCostsAndConfirm(
  period: string,
  employeeIds: string[]
): Promise<boolean> {
  const { data: existing } = await supabase
    .from("hr_employee_costs")
    .select("id")
    .eq("period", `${period}-01`)
    .in("employee_id", employeeIds)
    .limit(1);

  if (existing && existing.length > 0) {
    const confirmOverwrite = window.confirm(
      `Ya existen costes para el período ${period}. ¿Deseas sobrescribirlos?`
    );
    
    if (!confirmOverwrite) {
      return false;
    }

    // Eliminar costes existentes
    await supabase
      .from("hr_employee_costs")
      .delete()
      .eq("period", `${period}-01`)
      .in("employee_id", employeeIds);
  }

  return true;
}

/**
 * Importa costes en lotes
 */
async function bulkInsertCosts(
  costs: CostInsert[],
  bulkCreateFn: (costs: CostInsert[]) => Promise<void>,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const BATCH_SIZE = 50;
  
  for (let i = 0; i < costs.length; i += BATCH_SIZE) {
    const batch = costs.slice(i, i + BATCH_SIZE);
    console.log(`[A3Nom][Import] Batch ${i}-${Math.min(i + BATCH_SIZE, costs.length)} de ${costs.length}`);
    
    await bulkCreateFn(batch);
    
    if (onProgress) {
      onProgress(Math.min(i + BATCH_SIZE, costs.length), costs.length);
    }
  }
}

/**
 * Orquesta la importación completa de datos A3Nom
 */
export async function importA3NomData(
  options: A3NomImportOptions
): Promise<A3NomImportResult> {
  const { parseResult, period, onProgress, createEmployeesFn, bulkCreateCostsFn } = options;
  
  console.group("[A3Nom][Import] Inicio");
  console.log("Total registros:", parseResult.data.length);
  console.log("Período:", period);

  try {
    // 1. Obtener catálogo de empresas
    const companyMap = await fetchCompanyMap();

    // 2. Validar empresas
    const validation = validateCompaniesExist(parseResult.data, companyMap);
    if (!validation.valid) {
      throw new Error(
        `Empresas no encontradas en el catálogo: ${validation.missing.join(", ")}`
      );
    }

    // 3. Obtener empleados existentes
    const employeeCodes = parseResult.data.map(d => d.employee_code);
    const employeeMap = await fetchEmployeeMap(employeeCodes);
    console.log("[A3Nom][Import] EmployeeMap size:", employeeMap.size);

    // 4. Identificar empleados faltantes
    const missing = identifyMissingEmployees(parseResult.data, companyMap, employeeMap);
    console.warn("[A3Nom][Import] Empleados faltantes:", missing.length);

    let employeesCreated = 0;

    if (missing.length > 0) {
      onProgress?.(0, missing.length);
      
      const employeesToCreate = prepareEmployeesToCreate(missing, companyMap, period);
      console.log("[A3Nom][Import] Empleados a crear:", employeesToCreate.length);

      try {
        const newEmployees = await createEmployeesFn(employeesToCreate);
        employeesCreated = newEmployees.length;
        
        // Actualizar mapa con nuevos empleados
        updateEmployeeMapWithNew(employeeMap, newEmployees);
      } catch (error) {
        const errorMessage = (error as Error).message;
        console.error("[A3Nom][Import] Error creando empleados:", error);
        
        if (errorMessage.includes("row-level security") || errorMessage.includes("RLS")) {
          throw new Error("Error RLS: No se pudieron crear empleados. Verifica org_id.");
        }
        throw error;
      }
    }

    // 5. Preparar costes
    const preparationResult = prepareCostsForInsertion(
      parseResult.data,
      companyMap,
      employeeMap,
      period
    );

    console.log("[A3Nom][Import] Costes a insertar:", preparationResult.costs.length);
    console.log("[A3Nom][Import] Filtrados:", preparationResult.filtered);
    
    validateCostsForImport(preparationResult.costs);

    // 6. Verificar duplicados
    const shouldContinue = await checkExistingCostsAndConfirm(
      period,
      preparationResult.costs.map(c => c.employee_id!)
    );

    if (!shouldContinue) {
      throw new Error("Importación cancelada por el usuario");
    }

    // 7. Importar costes
    await bulkInsertCosts(preparationResult.costs, bulkCreateCostsFn, onProgress);

    // 8. Calcular annual_salary para empleados sin salario base
    const uniqueEmployeeIds = Array.from(new Set(preparationResult.costs.map(c => c.employee_id).filter(Boolean))) as string[];
    
    const { data: employeesWithoutSalary } = await supabase
      .from("hr_employees")
      .select("id")
      .is("annual_salary", null)
      .in("id", uniqueEmployeeIds);
    
    if (employeesWithoutSalary && employeesWithoutSalary.length > 0) {
      console.log("[A3Nom][Import] Calculando salario anual para empleados:", employeesWithoutSalary.length);
      
      for (const emp of employeesWithoutSalary) {
        // Obtener bruto promedio de los últimos 3 meses
        const { data: recentCosts } = await supabase
          .from("hr_employee_costs")
          .select("bruto")
          .eq("employee_id", emp.id)
          .order("period", { ascending: false })
          .limit(3);
        
        if (recentCosts && recentCosts.length > 0) {
          const avgMonthlyBruto = recentCosts.reduce((sum, c) => sum + (c.bruto || 0), 0) / recentCosts.length;
          const estimatedAnnualSalary = Math.round(avgMonthlyBruto * 12);
          
          if (estimatedAnnualSalary > 0) {
            await supabase
              .from("hr_employees")
              .update({ annual_salary: estimatedAnnualSalary })
              .eq("id", emp.id);
          }
        }
      }
    }

    console.groupEnd();

    return {
      employeesCreated,
      costsImported: preparationResult.costs.length,
      warnings: preparationResult.warnings,
    };
  } catch (error) {
    console.error("[A3Nom][Import] Error:", error);
    console.groupEnd();
    throw error;
  }
}
