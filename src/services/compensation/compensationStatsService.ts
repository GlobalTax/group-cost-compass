/**
 * Servicio de cálculos y estadísticas de compensación
 * Extrae lógica financiera de componentes UI
 */

import type { Database } from "@/integrations/supabase/types";
import { COMPENSATION } from "@/lib/constants";

type EmployeeCost = Database['public']['Tables']['hr_employee_costs']['Row'];
type BonusPayment = Database['public']['Tables']['bonus_payments']['Row'];
type Employee = Database['public']['Tables']['hr_employees']['Row'];
type Deal = Database['public']['Tables']['deals']['Row'];

export interface CompensationStats {
  totalFixedSalary: number;
  totalBonusPaid: number;
  variablePercentage: number;
  activeEmployees: number;
  poolCommitted: number;
  showVariableAlert: boolean;
}

export interface CompensationStatsOptions {
  costs: EmployeeCost[];
  bonusPayments: BonusPayment[];
  employees: Employee[];
  deals: Deal[];
  currentYear: number;
  variableThreshold?: number;
}

/**
 * Calcula estadísticas de compensación para el año actual
 */
export function calculateCompensationStats(
  options: CompensationStatsOptions
): CompensationStats {
  const {
    costs,
    bonusPayments,
    employees,
    deals,
    currentYear,
    variableThreshold = COMPENSATION.VARIABLE_THRESHOLD_PERCENT,
  } = options;

  // Filtrar costes del año actual
  const currentYearCosts = costs.filter((cost) => {
    const costYear = new Date(cost.period).getFullYear();
    return costYear === currentYear;
  });

  // Calcular salario fijo total
  const totalFixedSalary = currentYearCosts.reduce(
    (sum, cost) => sum + Number(cost.bruto || 0),
    0
  );

  // Calcular bonus pagados
  const totalBonusPaid = bonusPayments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  // Calcular porcentaje variable
  const variablePercentage =
    totalFixedSalary > 0 ? (totalBonusPaid / totalFixedSalary) * 100 : 0;

  // Contar empleados activos
  const activeEmployees = employees.filter((emp) => !emp.termination_date).length;

  // Calcular pool comprometido de deals activos
  const activeDeals = deals.filter(
    (d) => d.status === "active" || d.status === "pipeline"
  );
  const poolCommitted = activeDeals.reduce(
    (sum, deal) => sum + Number(deal.success_fee_pool || 0),
    0
  );

  // Alerta si supera umbral
  const showVariableAlert = variablePercentage > variableThreshold;

  return {
    totalFixedSalary,
    totalBonusPaid,
    variablePercentage,
    activeEmployees,
    poolCommitted,
    showVariableAlert,
  };
}

/**
 * Calcula el pool disponible (comprometido menos pagado)
 */
export function calculateAvailablePool(
  poolCommitted: number,
  totalBonusPaid: number
): number {
  return Math.max(0, poolCommitted - totalBonusPaid);
}

/**
 * Valida si un bonus propuesto excede el pool disponible
 */
export function validateBonusAgainstPool(
  proposedBonus: number,
  poolCommitted: number,
  totalBonusPaid: number
): { valid: boolean; reason?: string } {
  const available = calculateAvailablePool(poolCommitted, totalBonusPaid);
  
  if (proposedBonus > available) {
    return {
      valid: false,
      reason: `El bonus propuesto (${proposedBonus.toFixed(2)}€) excede el pool disponible (${available.toFixed(2)}€)`,
    };
  }
  
  return { valid: true };
}
