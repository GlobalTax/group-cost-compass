/**
 * Servicio de análisis de KPIs mensuales
 * Extrae lógica de negocio del hook useMonthlyKPIs
 */

import { fetchCosts } from "@/lib/supabase/repositories/costs.repo";
import { fetchEmployees } from "@/lib/supabase/repositories/employees.repo";
import { supabase } from "@/lib/supabase/client";
import { format, subMonths } from "date-fns";

export interface MonthlyKPIFilters {
  month: string; // "YYYY-MM"
  companyId?: string;
}

export interface MonthlyKPIsData {
  // Mes actual
  costeTotal: number;
  ingresoTotal: number;
  margen: number;
  plantilla: number;
  incorporaciones: number;

  // Mes anterior
  prevCosteTotal: number;
  prevIngresoTotal: number;
  prevMargen: number;
  prevPlantilla: number;
  prevIncorporaciones: number;

  // Deltas
  costeDelta: number;
  costeDeltaPercent: number;
  ingresoDelta: number;
  ingresoDeltaPercent: number;
  margenDelta: number;
  margenDeltaPercent: number;
  plantillaDelta: number;
  plantillaDeltaPercent: number;
  incorporacionesDelta: number;
  incorporacionesDeltaPercent: number;
}

const calculateDelta = (current: number, prev: number) => {
  const delta = current - prev;
  const percent = prev !== 0 ? (delta / prev) * 100 : 0;
  return { delta, percent };
};

/**
 * Calculate monthly KPIs with comparison to previous month
 */
export const calculateMonthlyKPIs = async (
  filters: MonthlyKPIFilters
): Promise<MonthlyKPIsData> => {
  const [year, month] = filters.month.split("-").map(Number);
  const currentDate = new Date(year, month - 1, 1);
  const prevDate = subMonths(currentDate, 1);

  const currentMonth = format(currentDate, "yyyy-MM");
  const prevMonth = format(prevDate, "yyyy-MM");

  const currentStartDate = `${currentMonth}-01`;
  const currentEndDate = format(new Date(year, month, 0), "yyyy-MM-dd");
  const prevStartDate = `${prevMonth}-01`;
  const prevEndDate = format(
    new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0),
    "yyyy-MM-dd"
  );

  // Query 1: Costes del mes actual y anterior
  let costsQuery = supabase
    .from("hr_employee_costs")
    .select(
      `
      period,
      coste_empresa,
      hr_employees!inner(company_id)
    `
    )
    .gte("period", prevStartDate)
    .lte("period", currentEndDate);

  if (filters.companyId && filters.companyId !== "all") {
    costsQuery = costsQuery.eq("hr_employees.company_id", filters.companyId);
  }

  const { data: costs, error: costsError } = await costsQuery;
  if (costsError) throw costsError;

  const currentCosts = costs?.filter((c) =>
    c.period.startsWith(currentMonth)
  );
  const prevCosts = costs?.filter((c) => c.period.startsWith(prevMonth));

  const costeTotal =
    currentCosts?.reduce((sum, c) => sum + (c.coste_empresa || 0), 0) || 0;
  const prevCosteTotal =
    prevCosts?.reduce((sum, c) => sum + (c.coste_empresa || 0), 0) || 0;

  // Query 2: Ingresos del mes actual y anterior
  let revenuesQuery = supabase
    .from("revenue_items")
    .select("period, total_amount, company_id")
    .gte("period", prevStartDate)
    .lte("period", currentEndDate);

  if (filters.companyId && filters.companyId !== "all") {
    revenuesQuery = revenuesQuery.eq("company_id", filters.companyId);
  }

  const { data: revenues, error: revenuesError } = await revenuesQuery;
  if (revenuesError) throw revenuesError;

  const currentRevenues = revenues?.filter(
    (r) => r.period >= currentStartDate && r.period <= currentEndDate
  );
  const prevRevenues = revenues?.filter(
    (r) => r.period >= prevStartDate && r.period <= prevEndDate
  );

  const ingresoTotal =
    currentRevenues?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;
  const prevIngresoTotal =
    prevRevenues?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0;

  // Query 3 y 4: Plantilla activa e Incorporaciones
  let empQuery = supabase
    .from("hr_employees")
    .select("id, hire_date, termination_date, employment_status, company_id");

  if (filters.companyId && filters.companyId !== "all") {
    empQuery = empQuery.eq("company_id", filters.companyId);
  }

  const { data: employees, error: empError } = await empQuery;
  if (empError) throw empError;

  const endOfCurrentDate = new Date(year, month, 0);
  const endOfPrevDate = new Date(
    prevDate.getFullYear(),
    prevDate.getMonth() + 1,
    0
  );

  // Plantilla activa al final de cada mes
  const plantilla =
    employees?.filter((e) => {
      const hired = !e.hire_date || new Date(e.hire_date) <= endOfCurrentDate;
      const notTerminated =
        !e.termination_date ||
        new Date(e.termination_date) > endOfCurrentDate;
      return hired && notTerminated && e.employment_status !== "terminated";
    }).length || 0;

  const prevPlantilla =
    employees?.filter((e) => {
      const hired = !e.hire_date || new Date(e.hire_date) <= endOfPrevDate;
      const notTerminated =
        !e.termination_date || new Date(e.termination_date) > endOfPrevDate;
      return hired && notTerminated && e.employment_status !== "terminated";
    }).length || 0;

  // Incorporaciones del mes (hire_date dentro del mes)
  const incorporaciones =
    employees?.filter((e) => {
      if (!e.hire_date) return false;
      const hireDate = new Date(e.hire_date);
      return (
        hireDate >= new Date(currentStartDate) && hireDate <= endOfCurrentDate
      );
    }).length || 0;

  const prevIncorporaciones =
    employees?.filter((e) => {
      if (!e.hire_date) return false;
      const hireDate = new Date(e.hire_date);
      return hireDate >= new Date(prevStartDate) && hireDate <= endOfPrevDate;
    }).length || 0;

  // Calcular Margen
  const margen = ingresoTotal - costeTotal;
  const prevMargen = prevIngresoTotal - prevCosteTotal;

  // Calcular todos los deltas
  const costeDeltaCalc = calculateDelta(costeTotal, prevCosteTotal);
  const ingresoDeltaCalc = calculateDelta(ingresoTotal, prevIngresoTotal);
  const margenDeltaCalc = calculateDelta(margen, prevMargen);
  const plantillaDeltaCalc = calculateDelta(plantilla, prevPlantilla);
  const incorporacionesDeltaCalc = calculateDelta(
    incorporaciones,
    prevIncorporaciones
  );

  return {
    costeTotal,
    ingresoTotal,
    margen,
    plantilla,
    incorporaciones,

    prevCosteTotal,
    prevIngresoTotal,
    prevMargen,
    prevPlantilla,
    prevIncorporaciones,

    costeDelta: costeDeltaCalc.delta,
    costeDeltaPercent: costeDeltaCalc.percent,
    ingresoDelta: ingresoDeltaCalc.delta,
    ingresoDeltaPercent: ingresoDeltaCalc.percent,
    margenDelta: margenDeltaCalc.delta,
    margenDeltaPercent: margenDeltaCalc.percent,
    plantillaDelta: plantillaDeltaCalc.delta,
    plantillaDeltaPercent: plantillaDeltaCalc.percent,
    incorporacionesDelta: incorporacionesDeltaCalc.delta,
    incorporacionesDeltaPercent: incorporacionesDeltaCalc.percent,
  };
};
