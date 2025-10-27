/**
 * Consolida registros duplicados de empleados
 */

import type { ParsedA3NomCost } from "./types";

/**
 * Consolida costes de empleados duplicados sumando los valores
 * Criterio: mismo employee_code dentro de la misma empresa
 */
export const consolidateDuplicates = (
  costs: ParsedA3NomCost[]
): ParsedA3NomCost[] => {
  const consolidated = new Map<string, ParsedA3NomCost>();
  const employeeCompanies = new Map<string, Set<string>>();

  for (const cost of costs) {
    const key = `${cost.company_nif}:${cost.employee_code}`;

    // Rastrear en qué empresas aparece cada empleado
    if (!employeeCompanies.has(cost.employee_code)) {
      employeeCompanies.set(cost.employee_code, new Set());
    }
    employeeCompanies.get(cost.employee_code)!.add(cost.company_nif);

    if (consolidated.has(key)) {
      // Sumar valores al registro existente
      const existing = consolidated.get(key)!;
      existing.bruto += cost.bruto;
      existing.coste_empresa += cost.coste_empresa;
      existing.sal_neto = (existing.sal_neto || 0) + (cost.sal_neto || 0);
      existing.total_tc1 = (existing.total_tc1 || 0) + (cost.total_tc1 || 0);
    } else {
      consolidated.set(key, { ...cost });
    }
  }

  // Advertir si un empleado aparece en múltiples empresas
  for (const [empCode, companies] of employeeCompanies.entries()) {
    if (companies.size > 1) {
      console.warn(
        `[Consolidator] Empleado ${empCode} aparece en ${companies.size} empresas: ${Array.from(companies).join(", ")}`
      );
    }
  }

  return Array.from(consolidated.values());
};
