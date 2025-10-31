/**
 * Servicio de preparación de costes para inserción
 * Transforma datos A3Nom a formato DB con validaciones
 */

import type { ParsedA3NomCost } from "@/lib/parsers/a3nom/types";
import type { Database } from "@/integrations/supabase/types";

export type CostInsert = Database['public']['Tables']['hr_employee_costs']['Insert'];

interface CompanyInfo {
  id: string;
  name: string;
  org_id: string;
}

export interface CostsPreparationResult {
  costs: CostInsert[];
  filtered: number;
  warnings: string[];
}

/**
 * Prepara registros de costes con validación estricta
 */
export function prepareCostsForInsertion(
  costs: ParsedA3NomCost[],
  companyMap: Map<string, CompanyInfo>,
  employeeMap: Map<string, string>,
  period: string
): CostsPreparationResult {
  const warnings: string[] = [];
  let filteredCount = 0;
  
  const validCosts = costs
    .filter(d => {
      const companyInfo = companyMap.get(d.company_nif);
      
      if (!companyInfo) {
        warnings.push(`Empresa con NIF ${d.company_nif} no encontrada en catálogo`);
        filteredCount++;
        return false;
      }

      // Buscar empleado con clave compuesta (empresa+código)
      const compositeKey = `${companyInfo.id}:${d.employee_code}`;
      const hasEmployee = employeeMap.has(compositeKey);
      
      if (!hasEmployee) {
        warnings.push(`Empleado ${d.employee_name} (${d.employee_code}) no encontrado en ${companyInfo.name}`);
        filteredCount++;
        return false;
      }
      
      return true;
    })
    .map(d => {
      const companyInfo = companyMap.get(d.company_nif)!;
      const compositeKey = `${companyInfo.id}:${d.employee_code}`;
      const employeeId = employeeMap.get(compositeKey)!;
      
      return {
        employee_id: employeeId,
        period: `${period}-01`,
        bruto: d.bruto,
        coste_empresa: d.coste_empresa,
        sal_neto: d.sal_neto,
        total_tc1: d.total_tc1,
        irpf_dinero: d.irpf_dinero,
        irpf_especie: d.irpf_especie,
        ss_trabajador: d.ss_trabajador,
        ss_empresa: d.ss_empresa,
        anticipos: d.anticipos,
        embargos: d.embargos,
        dto_preaviso: d.dto_preaviso,
        dtos_varios: d.dtos_varios,
        prestamos: d.prestamos,
        dto_especial: d.dto_especial,
        indemnizacion: d.indemnizacion,
        enf_acc: d.enf_acc,
        bonificacion: d.bonificacion,
      };
    });
  
  return {
    costs: validCosts,
    filtered: filteredCount,
    warnings,
  };
}

/**
 * Valida que haya datos válidos para importar
 */
export function validateCostsForImport(costs: CostInsert[]): void {
  if (costs.length === 0) {
    throw new Error("No hay datos válidos para importar");
  }
}
