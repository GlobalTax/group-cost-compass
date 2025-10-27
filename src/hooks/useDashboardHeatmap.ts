/**
 * Hook especializado para datos de heatmap mensual
 * Extrae lógica de useDashboardGlobal
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY } from "@/lib/constants";
import type { DashboardFilters } from "./useDashboardGlobal";

export const useDashboardHeatmap = (filters?: DashboardFilters) => {
  return useQuery({
    queryKey: ["dashboard-heatmap", filters],
    queryFn: async () => {
      const currentYear = filters?.year || new Date().getFullYear();

      // Usar vista optimizada vw_dashboard_monthly (tipado como any mientras se regeneran tipos)
      let query = supabase
        .from("vw_dashboard_monthly" as any)
        .select("*")
        .gte("month", `${currentYear}-01-01`)
        .lte("month", `${currentYear}-12-31`)
        .order("month");

      if (filters?.companyId) {
        query = query.eq("company_id", filters.companyId);
      }

      const { data, error }: { data: any; error: any } = await query;
      if (error) throw error;

      // Agrupar por mes
      const monthlyData = (data || []).reduce(
        (acc, row) => {
          const month = row.month.substring(0, 7); // YYYY-MM
          if (!acc[month]) {
            acc[month] = {
              month,
              totalCost: 0,
              employees: 0,
            };
          }

          acc[month].totalCost += row.total_coste || 0;
          // Sumar empleados únicos (ya están agregados por la vista)
          acc[month].employees += row.employees_count || 0;

          return acc;
        },
        {} as Record<string, any>
      );

      // Formatear resultado
      return Object.values(monthlyData).map((m: any) => ({
        month: m.month,
        avgCostPerEmployee: m.employees > 0 ? m.totalCost / m.employees : 0,
        employees: m.employees,
      }));
    },
    staleTime: QUERY.STALE_TIME,
    retry: QUERY.RETRY,
  });
};
