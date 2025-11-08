/**
 * Hook especializado para KPIs del dashboard
 * Delega lógica de negocio al servicio dashboardStatsService
 */

import { useQuery } from "@tanstack/react-query";
import { calculateDashboardKPIs, type DashboardFilters } from "@/services/analytics/dashboardStatsService";
import { QUERY } from "@/lib/constants";

export const useDashboardKPIs = (filters?: DashboardFilters) => {
  return useQuery({
    queryKey: ["dashboard-kpis", filters],
    queryFn: () => calculateDashboardKPIs(filters),
    staleTime: QUERY.STALE_TIME,
    retry: QUERY.RETRY,
  });
};
