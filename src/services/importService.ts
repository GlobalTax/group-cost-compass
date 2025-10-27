/**
 * Servicio de importación centralizado
 * Extrae toda la lógica de negocio de Upload.tsx
 */

import { supabase } from "@/integrations/supabase/client";
import type { UploadCostRow, UploadValidationResult } from "@/lib/validators/uploadSchema";
import type { ParsedEmployee } from "@/lib/parsers/employeeParser";
import { IMPORT } from "@/lib/constants";

export interface ImportEmployeesOptions {
  employees: ParsedEmployee[];
  companies: Array<{ id: string; name: string }>;
  onProgress?: (current: number, total: number) => void;
}

export interface ImportCostsOptions {
  validation: UploadValidationResult<UploadCostRow>;
  companies: Array<{ id: string; name: string }>;
  onProgress?: (current: number, total: number) => void;
}

/**
 * Importa empleados verificando que las empresas existan
 */
export const importEmployees = async ({
  employees,
  companies,
  onProgress,
}: ImportEmployeesOptions) => {
  const results = { created: 0, errors: [] as string[] };

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    const company = companies.find((c) => c.name === emp.company_name);

    if (!company) {
      results.errors.push(`Empresa no encontrada: ${emp.company_name}`);
      continue;
    }

    try {
      const { error } = await supabase.from("hr_employees").insert({
        full_name: emp.full_name,
        dni: emp.dni || null,
        company_id: company.id,
        hire_date: emp.hire_date,
        termination_date: emp.termination_date || null,
        seniority_date: emp.seniority_date || null,
        transfer_group: emp.transfer_group || false,
        notes: emp.notes || null,
      });

      if (error) throw error;
      results.created++;
    } catch (error) {
      results.errors.push(`Error al crear ${emp.full_name}: ${(error as Error).message}`);
    }

    onProgress?.(i + 1, employees.length);
  }

  return results;
};

/**
 * Mapea NIFs a employee_ids desde la base de datos
 */
export const mapNifToEmployeeId = async (
  nifs: string[]
): Promise<Map<string, string>> => {
  const { data: employees } = await supabase
    .from("hr_employees")
    .select("id, dni")
    .in("dni", nifs);

  return new Map(employees?.map((e) => [e.dni, e.id]) || []);
};

/**
 * Verifica si ya existen costes para los períodos dados
 */
export const checkDuplicatePeriods = async (
  periods: string[]
): Promise<boolean> => {
  const { data: existing } = await supabase
    .from("hr_employee_costs")
    .select("period")
    .in("period", periods)
    .limit(1);

  return !!existing && existing.length > 0;
};

/**
 * Importa costes en lotes con manejo de duplicados
 */
export const importCosts = async ({
  validation,
  onProgress,
}: ImportCostsOptions) => {
  // Filtrar solo filas válidas
  const validRows = validation.rows
    .filter((r) => r.data && r.errors.length === 0)
    .map((r) => r.data!);

  if (validRows.length === 0) {
    throw new Error("No hay datos válidos para importar");
  }

  // Mapear NIFs a employee_ids
  const nifs = validRows.map((r) => r.nif);
  const employeeMap = await mapNifToEmployeeId(nifs);

  // Preparar costes
  const costsToImport = validRows
    .filter((r) => employeeMap.has(r.nif))
    .map((r) => ({
      employee_id: employeeMap.get(r.nif)!,
      period: `${r.date}-01`, // Normalizar a primer día del mes
      bruto: r.bruto,
      coste_empresa: r.coste_empresa,
    }));

  if (costsToImport.length === 0) {
    throw new Error("Ningún empleado encontrado con los NIFs proporcionados");
  }

  // Verificar duplicados
  const periods = [...new Set(costsToImport.map((c) => c.period))];
  const hasDuplicates = await checkDuplicatePeriods(periods);

  if (hasDuplicates) {
    const confirmed = window.confirm(
      "Ya existen costes para algunos períodos. ¿Desea sobrescribir?"
    );
    if (!confirmed) {
      throw new Error("Importación cancelada por el usuario");
    }

    // Eliminar costes existentes
    await supabase
      .from("hr_employee_costs")
      .delete()
      .in("period", periods);
  }

  // Importar en lotes
  const { BATCH_SIZE } = IMPORT;
  for (let i = 0; i < costsToImport.length; i += BATCH_SIZE) {
    const batch = costsToImport.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from("hr_employee_costs").insert(batch);

    if (error) throw error;
    onProgress?.(Math.min(i + BATCH_SIZE, costsToImport.length), costsToImport.length);
  }

  return { imported: costsToImport.length, total: validRows.length };
};
