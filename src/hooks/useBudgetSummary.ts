import { useQuery } from '@tanstack/react-query';
import { fetchBudgetSummary } from '@/lib/supabase/repositories/budget.repo';

export const useBudgetSummary = (filters?: {
  year?: number;
  companyId?: string;
}) => {
  return useQuery({
    queryKey: ['budgetSummary', filters],
    queryFn: () => fetchBudgetSummary(filters),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};
