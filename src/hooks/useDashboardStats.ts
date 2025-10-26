import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { 
  fetchCostsForStats, 
  fetchCosts,
  calculateYearComparison,
  groupCostsByMonth
} from "@/lib/supabase/repositories/costs.repo";

export const useDashboardStats = (filters?: {
  companyId?: string;
  year?: number;
}) => {
  return useQuery({
    queryKey: ["dashboard-stats", filters],
    queryFn: async () => {
      const currentYear = filters?.year || new Date().getFullYear();

      // 1. Get active employees (mantener como está: simple count)
      let employeesQuery = supabase
        .from("hr_employees")
        .select("*", { count: "exact", head: true })
        .is("termination_date", null);

      if (filters?.companyId) {
        employeesQuery = employeesQuery.eq("company_id", filters.companyId);
      }

      const { count: activeEmployees } = await employeesQuery;

      // 2. Get current year costs (OPTIMIZADO: filtro server-side)
      const currentYearCosts = await fetchCostsForStats({
        year: currentYear,
        companyId: filters?.companyId,
      });

      const brutoTotal = currentYearCosts.reduce((sum, c) => sum + (c.bruto || 0), 0);
      const costeTotal = currentYearCosts.reduce((sum, c) => sum + (c.coste_empresa || 0), 0);

      // 3. Get previous year costs (OPTIMIZADO)
      const prevYear = currentYear - 1;
      const previousYearCosts = await fetchCostsForStats({
        year: prevYear,
        companyId: filters?.companyId,
      });

      // 4. Calculate comparison (lógica centralizada)
      const comparison = calculateYearComparison(currentYearCosts, previousYearCosts);

      return {
        activeEmployees: activeEmployees || 0,
        brutoTotal,
        costeTotal,
        brutoChange: comparison.brutoChangePercent,
        costsCount: currentYearCosts.length,
      };
    },
    staleTime: 60000, // 1 minuto
  });
};

export const useMonthlyCosts = (filters?: {
  companyId?: string;
  year?: number;
}) => {
  return useQuery({
    queryKey: ["monthly-costs", filters],
    queryFn: async () => {
      const currentYear = filters?.year || new Date().getFullYear();

      // Fetch costs con filtros server-side
      const costs = await fetchCosts({
        year: currentYear,
        companyId: filters?.companyId,
      });

      // Group by month (transformación centralizada)
      return groupCostsByMonth(costs);
    },
    staleTime: 60000,
  });
};
