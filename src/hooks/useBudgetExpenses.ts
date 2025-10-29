import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBudgetExpenses,
  createBudgetExpense,
  updateBudgetExpense,
  deleteBudgetExpense,
} from '@/lib/supabase/repositories/budget.repo';
import { toast } from 'sonner';

export const useBudgetExpenses = (budgetPeriodId: string | undefined) => {
  return useQuery({
    queryKey: ['budgetExpenses', budgetPeriodId],
    queryFn: () => (budgetPeriodId ? fetchBudgetExpenses(budgetPeriodId) : []),
    enabled: !!budgetPeriodId,
    staleTime: 30000,
  });
};

export const useCreateBudgetExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudgetExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      toast.success('Gasto añadido correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al añadir gasto: ${error.message}`);
    },
  });
};

export const useUpdateBudgetExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateBudgetExpense(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      toast.success('Gasto actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar gasto: ${error.message}`);
    },
  });
};

export const useDeleteBudgetExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudgetExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetExpenses'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      toast.success('Gasto eliminado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar gasto: ${error.message}`);
    },
  });
};
