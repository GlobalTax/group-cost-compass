import { useQuery } from "@tanstack/react-query";
import { calculateMonthlyKPIs, type MonthlyKPIFilters, type MonthlyKPIsData } from "@/services/analytics/monthlyKPIService";

/**
 * Hook ligero para KPIs mensuales
 * Delega lógica de negocio al servicio monthlyKPIService
 */
export const useMonthlyKPIs = (filters: MonthlyKPIFilters) => {
  return useQuery({
    queryKey: ["monthly-kpis", filters.month, filters.companyId],
    queryFn: () => calculateMonthlyKPIs(filters),
    staleTime: 60000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
