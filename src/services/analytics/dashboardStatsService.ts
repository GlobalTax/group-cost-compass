/**
 * Servicio de análisis para estadísticas del dashboard
 * Extrae lógica de negocio del hook useDashboardKPIs
 */

import { supabase } from "@/lib/supabase/client";

export interface DashboardFilters {
  year?: number;
  companyId?: string;
  month?: string; // "YYYY-MM"
}

export interface DashboardKPIs {
  costeTotal: number;
  activeEmployees: number;
  avgCostPerEmployee: number;
  salaryIncreasePercent: number;
}

/**
 * Calculate dashboard KPIs (costs, employees, salary increase)
 */
export const calculateDashboardKPIs = async (
  filters?: DashboardFilters
): Promise<DashboardKPIs> => {
  const currentYear = filters?.year || new Date().getFullYear();
  const prevYear = currentYear - 1;

  // Determinar rango de fechas según filtro de mes
  let currentStartDate: string;
  let currentEndDate: string;
  let prevStartDate: string;
  let prevEndDate: string;

  if (filters?.month) {
    // Filtro por mes específico
    currentStartDate = `${filters.month}-01`;
    currentEndDate = `${filters.month}-31`;
    // Mes anterior del año anterior
    const [year, monthNum] = filters.month.split("-");
    prevStartDate = `${prevYear}-${monthNum}-01`;
    prevEndDate = `${prevYear}-${monthNum}-31`;
  } else {
    // Filtro por año completo
    currentStartDate = `${currentYear}-01-01`;
    currentEndDate = `${currentYear}-12-31`;
    prevStartDate = `${prevYear}-01-01`;
    prevEndDate = `${prevYear}-12-31`;
  }

  // Query actual period con join a employees
  const { data: currentCosts, error: currentError } = await supabase
    .from("hr_employee_costs")
    .select(
      `
      bruto,
      coste_empresa,
      hr_employees!inner (
        id,
        company_id,
        termination_date
      )
    `
    )
    .gte("period", currentStartDate)
    .lte("period", currentEndDate);

  if (currentError) throw currentError;

  // Filtrar por empresa si es necesario
  const filteredCurrent = filters?.companyId
    ? currentCosts?.filter((c) => c.hr_employees?.company_id === filters.companyId)
    : currentCosts;

  // Query previous period
  const { data: prevCosts, error: prevError } = await supabase
    .from("hr_employee_costs")
    .select(
      `
      bruto,
      hr_employees!inner (
        company_id
      )
    `
    )
    .gte("period", prevStartDate)
    .lte("period", prevEndDate);

  if (prevError) throw prevError;

  const filteredPrev = filters?.companyId
    ? prevCosts?.filter((c) => c.hr_employees?.company_id === filters.companyId)
    : prevCosts;

  // Calcular totales
  const costeTotal =
    filteredCurrent?.reduce((sum, c) => sum + (c.coste_empresa || 0), 0) || 0;
  const brutoTotal =
    filteredCurrent?.reduce((sum, c) => sum + (c.bruto || 0), 0) || 0;
  const prevBrutoTotal =
    filteredPrev?.reduce((sum, c) => sum + (c.bruto || 0), 0) || 0;

  // Empleados activos (sin fecha de baja)
  const activeEmployeesSet = new Set(
    filteredCurrent
      ?.filter((c) => !c.hr_employees?.termination_date)
      .map((c) => c.hr_employees?.id)
  );
  const activeEmployees = activeEmployeesSet.size;

  // Cálculos derivados
  const avgCostPerEmployee =
    activeEmployees > 0 ? costeTotal / activeEmployees : 0;
  const salaryIncreasePercent =
    prevBrutoTotal > 0 ? ((brutoTotal - prevBrutoTotal) / prevBrutoTotal) * 100 : 0;

  return {
    costeTotal,
    activeEmployees,
    avgCostPerEmployee,
    salaryIncreasePercent,
  };
};
