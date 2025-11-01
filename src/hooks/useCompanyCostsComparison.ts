import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { calculatePercentageChange } from "@/lib/formatters";

export interface CompanyCostsSummary {
  company_id: string;
  company_name: string;
  num_employees_current: number;
  num_employees_previous: number;
  coste_mensual_actual: number;
  coste_acumulado_ytd: number;
  coste_acumulado_year_anterior: number;
  variacion_percent: number;
  variacion_euros: number;
  variacion_empleados_absoluta: number;
  variacion_empleados_percent: number;
}

interface MonthlyData {
  company_id: string;
  company_name: string;
  year: number;
  month: number;
  num_employees: number;
  coste_empresa_mensual: number;
}

interface CompanyCostsFilters {
  year: number;
  month?: number;
  companyId?: string;
}

/**
 * Hook para obtener comparativa de costes por empresa con YoY
 * Usa vw_company_costs_monthly para agregación optimizada
 */
export const useCompanyCostsComparison = (filters: CompanyCostsFilters) => {
  const { year, month, companyId } = filters;

  return useQuery({
    queryKey: ["company-costs-comparison", year, month, companyId],
    queryFn: async (): Promise<CompanyCostsSummary[]> => {
      // 1. Obtener datos año actual
      let currentQuery = supabase
        .from("vw_company_costs_monthly")
        .select("*")
        .eq("year", year);

      if (companyId && companyId !== "all") {
        currentQuery = currentQuery.eq("company_id", companyId);
      }

      // Si se especifica mes, filtrar por ese mes. Si no, YTD
      if (month) {
        currentQuery = currentQuery.eq("month", month);
      } else {
        // Acumulado YTD: todos los meses hasta hoy
        const currentMonth = new Date().getMonth() + 1;
        if (year === new Date().getFullYear()) {
          currentQuery = currentQuery.lte("month", currentMonth);
        }
      }

      const { data: currentData, error: currentError } = await currentQuery;
      if (currentError) throw currentError;

      // 2. Obtener datos año anterior (mismo período)
      let previousQuery = supabase
        .from("vw_company_costs_monthly")
        .select("*")
        .eq("year", year - 1);

      if (companyId && companyId !== "all") {
        previousQuery = previousQuery.eq("company_id", companyId);
      }

      if (month) {
        previousQuery = previousQuery.eq("month", month);
      } else {
        const currentMonth = new Date().getMonth() + 1;
        if (year === new Date().getFullYear()) {
          previousQuery = previousQuery.lte("month", currentMonth);
        }
      }

      const { data: previousData, error: previousError } = await previousQuery;
      if (previousError) throw previousError;

      // 3. Agrupar por empresa
      const companies = new Map<string, CompanyCostsSummary>();

      // Procesar datos año actual
      (currentData as MonthlyData[] || []).forEach((row) => {
        if (!companies.has(row.company_id)) {
          companies.set(row.company_id, {
            company_id: row.company_id,
            company_name: row.company_name,
            num_employees_current: 0,
            num_employees_previous: 0,
            coste_mensual_actual: 0,
            coste_acumulado_ytd: 0,
            coste_acumulado_year_anterior: 0,
            variacion_percent: 0,
            variacion_euros: 0,
            variacion_empleados_absoluta: 0,
            variacion_empleados_percent: 0,
          });
        }

        const company = companies.get(row.company_id)!;
        company.num_employees_current = Math.max(company.num_employees_current, row.num_employees);
        company.coste_mensual_actual += row.coste_empresa_mensual || 0;
        company.coste_acumulado_ytd += row.coste_empresa_mensual || 0;
      });

      // Procesar datos año anterior
      (previousData as MonthlyData[] || []).forEach((row) => {
        if (companies.has(row.company_id)) {
          const company = companies.get(row.company_id)!;
          company.num_employees_previous = Math.max(company.num_employees_previous, row.num_employees);
          company.coste_acumulado_year_anterior += row.coste_empresa_mensual || 0;
        }
      });

      // 4. Calcular variaciones
      const result = Array.from(companies.values()).map((company) => {
        const empDiff = company.num_employees_current - company.num_employees_previous;
        const empPercent = company.num_employees_previous > 0
          ? (empDiff / company.num_employees_previous) * 100
          : 0;

        return {
          ...company,
          variacion_euros: company.coste_acumulado_ytd - company.coste_acumulado_year_anterior,
          variacion_percent: calculatePercentageChange(
            company.coste_acumulado_ytd,
            company.coste_acumulado_year_anterior
          ),
          variacion_empleados_absoluta: empDiff,
          variacion_empleados_percent: empPercent,
        };
      });

      return result.sort((a, b) => b.coste_acumulado_ytd - a.coste_acumulado_ytd);
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
