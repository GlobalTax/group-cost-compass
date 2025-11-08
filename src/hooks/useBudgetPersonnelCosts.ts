import { useQuery } from "@tanstack/react-query";
import { fetchBudgetPersonnelCosts } from "@/lib/supabase/repositories/costs.repo";

/**
 * Hook para obtener costes de personal de un período presupuestario
 * 
 * @param period - Período en formato "YYYY-MM-DD"
 * @param companyId - ID de empresa (opcional, filtra por empresa)
 */
export const useBudgetPersonnelCosts = (period: string, companyId?: string | null) => {
  return useQuery({
    queryKey: ["budget-personnel-costs", period, companyId],
    queryFn: () => fetchBudgetPersonnelCosts(period, companyId),
    staleTime: 30000,
  });
};
