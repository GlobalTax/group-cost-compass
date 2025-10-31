/**
 * Servicio de matching de empleados
 * Identifica empleados existentes vs nuevos basándose en empresa+código
 */

import type { ParsedA3NomCost } from "@/lib/parsers/a3nom/types";
import type { Database } from "@/integrations/supabase/types";

type Employee = Database['public']['Tables']['hr_employees']['Row'];
type EmployeeInsert = Database['public']['Tables']['hr_employees']['Insert'];

interface CompanyInfo {
  id: string;
  name: string;
  org_id: string;
}

interface EmployeeBasic {
  id: string;
  employee_code: string;
  company_id: string;
}

export interface EmployeeMatchResult {
  employeeMap: Map<string, string>; // "companyId:code" → employeeId
  missingEmployees: EmployeeToCreate[];
}

export interface EmployeeToCreate {
  employee_code: string;
  full_name: string;
  company_id: string;
  org_id: string;
  hire_date: string;
  notes: string;
}

/**
 * Crea mapa de empleados existentes con clave compuesta empresa:código
 */
export function createEmployeeMap(employees: EmployeeBasic[]): Map<string, string> {
  return new Map(
    employees.map(e => [`${e.company_id}:${e.employee_code}`, e.id])
  );
}

/**
 * Identifica empleados que no existen en BD (por combinación empresa+código)
 */
export function identifyMissingEmployees(
  costs: ParsedA3NomCost[],
  companyMap: Map<string, CompanyInfo>,
  employeeMap: Map<string, string>
): ParsedA3NomCost[] {
  return costs.filter(d => {
    const companyInfo = companyMap.get(d.company_nif);
    if (!companyInfo) return false;
    const compositeKey = `${companyInfo.id}:${d.employee_code}`;
    return !employeeMap.has(compositeKey);
  });
}

/**
 * Prepara empleados para creación masiva
 */
export function prepareEmployeesToCreate(
  missingEmployees: ParsedA3NomCost[],
  companyMap: Map<string, CompanyInfo>,
  period: string
): EmployeeInsert[] {
  return missingEmployees.map(d => {
    const companyInfo = companyMap.get(d.company_nif)!;
    
    return {
      employee_code: d.employee_code,
      full_name: d.employee_name,
      company_id: companyInfo.id,
      org_id: companyInfo.org_id,
      hire_date: `${period}-01`,
      notes: `Creado automáticamente desde importación A3Nom ${period}`,
    };
  });
}

/**
 * Actualiza el mapa de empleados con los recién creados
 */
export function updateEmployeeMapWithNew(
  employeeMap: Map<string, string>,
  newEmployees: EmployeeBasic[]
): void {
  newEmployees.forEach(emp => {
    if (emp.employee_code && emp.company_id) {
      const compositeKey = `${emp.company_id}:${emp.employee_code}`;
      employeeMap.set(compositeKey, emp.id);
    }
  });
}

/**
 * Valida que todas las empresas del archivo existan en el catálogo
 */
export function validateCompaniesExist(
  costs: ParsedA3NomCost[],
  companyMap: Map<string, CompanyInfo>
): { valid: boolean; missing: string[] } {
  const missingCompanies = new Set<string>();
  
  for (const cost of costs) {
    if (!companyMap.has(cost.company_nif)) {
      missingCompanies.add(`${cost.company_name} (${cost.company_nif})`);
    }
  }
  
  return {
    valid: missingCompanies.size === 0,
    missing: Array.from(missingCompanies),
  };
}
