/**
 * Servicio de importación masiva de histórico de empleados
 */

import { supabase } from "@/integrations/supabase/client";
import type { ParsedEmployee, EmployeeGroup } from "@/lib/parsers/employeeHistoryParser";

export interface ImportOptions {
  clearExisting: boolean;
  generateCosts: boolean;
  detectTransfers: boolean;
  onlyActiveEmployees: boolean;
}

export interface ImportResult {
  employeesCreated: number;
  costsCreated: number;
  transfersDetected: number;
  errors: string[];
  warnings: string[];
}

const BATCH_SIZE = 100;

/**
 * Genera períodos mensuales entre dos fechas
 */
function generateMonthlyPeriods(startDate: string, endDate: string | null): string[] {
  const periods: string[] = [];
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  const current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endPeriod = new Date(end.getFullYear(), end.getMonth(), 1);
  
  while (current <= endPeriod) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    periods.push(`${year}-${month}-01`);
    current.setMonth(current.getMonth() + 1);
  }
  
  return periods;
}

/**
 * Limpia datos existentes
 */
async function clearExistingData(): Promise<void> {
  // Orden importante por foreign keys
  await supabase.from('hr_employee_costs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('hr_transfers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('hr_employees').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

/**
 * Inserta empleados en lotes
 */
async function bulkInsertEmployees(
  employees: ParsedEmployee[],
  onlyActive: boolean
): Promise<{ created: number; employeeMap: Map<string, string> }> {
  let created = 0;
  const employeeMap = new Map<string, string>(); // DNI+company+hire_date -> employee_id
  
  // Filtrar si solo queremos activos
  const filtered = onlyActive 
    ? employees.filter(e => !e.termination_date)
    : employees;
  
  for (let i = 0; i < filtered.length; i += BATCH_SIZE) {
    const batch = filtered.slice(i, i + BATCH_SIZE);
    
    const inserts = batch.map(emp => ({
      full_name: emp.full_name,
      dni: emp.dni,
      company_id: emp.company_id,
      hire_date: emp.hire_date,
      termination_date: emp.termination_date,
      seniority_date: emp.seniority_date,
      contract_type: emp.contract_type,
      notes: emp.annual_income === 0 ? 'Sin datos económicos históricos' : null,
    }));
    
    const { data, error } = await supabase
      .from('hr_employees')
      .insert(inserts)
      .select('id, dni, company_id, hire_date');
    
    if (error) {
      throw new Error(`Error al insertar empleados: ${error.message}`);
    }
    
    if (data) {
      created += data.length;
      
      // Mapear para relacionar con costes
      data.forEach((emp, idx) => {
        const original = batch[idx];
        const key = `${emp.dni}-${emp.company_id}-${emp.hire_date}`;
        employeeMap.set(key, emp.id);
      });
    }
  }
  
  return { created, employeeMap };
}

/**
 * Inserta costes mensuales en lotes
 */
async function bulkInsertCosts(
  employees: ParsedEmployee[],
  employeeMap: Map<string, string>
): Promise<number> {
  let created = 0;
  const allCosts: Array<{
    employee_id: string;
    period: string;
    bruto: number;
    coste_empresa: number;
  }> = [];
  
  // Generar costes para cada empleado
  for (const emp of employees) {
    if (emp.annual_income === 0) continue; // Sin datos económicos
    
    const key = `${emp.dni}-${emp.company_id}-${emp.hire_date}`;
    const employeeId = employeeMap.get(key);
    
    if (!employeeId) continue;
    
    const periods = generateMonthlyPeriods(emp.hire_date, emp.termination_date);
    
    for (const period of periods) {
      allCosts.push({
        employee_id: employeeId,
        period,
        bruto: emp.monthly_bruto,
        coste_empresa: emp.monthly_coste,
      });
    }
  }
  
  // Insertar en lotes
  for (let i = 0; i < allCosts.length; i += BATCH_SIZE) {
    const batch = allCosts.slice(i, i + BATCH_SIZE);
    
    const { error } = await supabase
      .from('hr_employee_costs')
      .insert(batch);
    
    if (error) {
      throw new Error(`Error al insertar costes: ${error.message}`);
    }
    
    created += batch.length;
  }
  
  return created;
}

/**
 * Detecta y crea transferencias automáticamente
 */
async function detectAndCreateTransfers(groups: EmployeeGroup[]): Promise<number> {
  let created = 0;
  
  // Solo procesar grupos con múltiples empresas
  const transferGroups = groups.filter(g => g.hasMultipleCompanies);
  
  for (const group of transferGroups) {
    // Obtener IDs de empleados creados
    const { data: employees } = await supabase
      .from('hr_employees')
      .select('id, company_id, hire_date, termination_date')
      .eq('dni', group.dni)
      .order('hire_date');
    
    if (!employees || employees.length < 2) continue;
    
    // Detectar traslados (contratos consecutivos en diferentes empresas)
    for (let i = 0; i < employees.length - 1; i++) {
      const current = employees[i];
      const next = employees[i + 1];
      
      if (current.company_id === next.company_id) continue;
      if (!current.termination_date) continue;
      
      // Calcular días entre terminación y nuevo alta
      const endDate = new Date(current.termination_date);
      const startDate = new Date(next.hire_date);
      const daysBetween = Math.floor((startDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysBetween <= 180) {
        // Es un traslado
        const { error } = await supabase.from('hr_transfers').insert({
          employee_id: next.id,
          from_company: current.company_id,
          to_company: next.company_id,
          transfer_date: next.hire_date,
          days_between: daysBetween,
          reason: 'Traslado interempresa detectado automáticamente',
        });
        
        if (!error) {
          created++;
          
          // Marcar ambos registros con transfer_group = true
          await supabase
            .from('hr_employees')
            .update({ transfer_group: true })
            .in('id', [current.id, next.id]);
        }
      }
    }
  }
  
  return created;
}

/**
 * Ejecuta importación masiva completa
 */
export async function bulkImportEmployeeHistory(
  employees: ParsedEmployee[],
  groups: EmployeeGroup[],
  options: ImportOptions
): Promise<ImportResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    // Paso 1: Limpiar si se solicita
    if (options.clearExisting) {
      await clearExistingData();
    }
    
    // Paso 2: Insertar empleados
    const { created: employeesCreated, employeeMap } = await bulkInsertEmployees(
      employees,
      options.onlyActiveEmployees
    );
    
    // Paso 3: Generar costes si se solicita
    let costsCreated = 0;
    if (options.generateCosts) {
      costsCreated = await bulkInsertCosts(employees, employeeMap);
    }
    
    // Paso 4: Detectar traslados si se solicita
    let transfersDetected = 0;
    if (options.detectTransfers) {
      transfersDetected = await detectAndCreateTransfers(groups);
    }
    
    return {
      employeesCreated,
      costsCreated,
      transfersDetected,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push((error as Error).message);
    return {
      employeesCreated: 0,
      costsCreated: 0,
      transfersDetected: 0,
      errors,
      warnings,
    };
  }
}
