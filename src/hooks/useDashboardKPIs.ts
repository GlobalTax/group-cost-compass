/**
 * Hook especializado para KPIs del dashboard
 * Extrae lógica de useDashboardGlobal
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY } from "@/lib/constants";
import type { DashboardFilters } from "./useDashboardGlobal";

export const useDashboardKPIs = (filters?: DashboardFilters) => {
  return useQuery({
    queryKey: ["dashboard-kpis", filters],
    queryFn: async () => {
      const currentYear = filters?.year || new Date().getFullYear();
      const prevYear = currentYear - 1;

      // Construir filtros base
      const baseFilters: any = {
        period: {
          gte: `${currentYear}-01-01`,
          lte: `${currentYear}-12-31`,
        },
      };

      if (filters?.companyId) {
        baseFilters.company_id = filters.companyId;
      }

      // Query actual year con join a employees
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
        .gte("period", `${currentYear}-01-01`)
        .lte("period", `${currentYear}-12-31`);

      if (currentError) throw currentError;

      // Filtrar por empresa si es necesario
      const filteredCurrent = filters?.companyId
        ? currentCosts?.filter((c) => c.hr_employees?.company_id === filters.companyId)
        : currentCosts;

      // Query previous year
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
        .gte("period", `${prevYear}-01-01`)
        .lte("period", `${prevYear}-12-31`);

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
    },
    staleTime: QUERY.STALE_TIME,
    retry: QUERY.RETRY,
  });
};
