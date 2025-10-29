import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBudgetIncome,
  createBudgetIncome,
  updateBudgetIncome,
  deleteBudgetIncome,
} from '@/lib/supabase/repositories/budget.repo';
import { toast } from 'sonner';

export const useBudgetIncome = (budgetPeriodId: string | undefined) => {
  return useQuery({
    queryKey: ['budgetIncome', budgetPeriodId],
    queryFn: () => (budgetPeriodId ? fetchBudgetIncome(budgetPeriodId) : []),
    enabled: !!budgetPeriodId,
    staleTime: 30000,
  });
};

export const useCreateBudgetIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudgetIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetIncome'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      toast.success('Ingreso añadido correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al añadir ingreso: ${error.message}`);
    },
  });
};

export const useUpdateBudgetIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateBudgetIncome(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetIncome'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      toast.success('Ingreso actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar ingreso: ${error.message}`);
    },
  });
};

export const useDeleteBudgetIncome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudgetIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetIncome'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      toast.success('Ingreso eliminado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar ingreso: ${error.message}`);
    },
  });
};
