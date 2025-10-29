import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBudgetPeriods,
  fetchBudgetPeriodById,
  createBudgetPeriod,
  updateBudgetPeriod,
  deleteBudgetPeriod,
} from '@/lib/supabase/repositories/budget.repo';
import { toast } from 'sonner';

export const useBudgetPeriods = (filters?: {
  year?: number;
  companyId?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ['budgetPeriods', filters],
    queryFn: () => fetchBudgetPeriods(filters),
    staleTime: 30000,
  });
};

export const useBudgetPeriod = (id: string | undefined) => {
  return useQuery({
    queryKey: ['budgetPeriod', id],
    queryFn: () => (id ? fetchBudgetPeriodById(id) : null),
    enabled: !!id,
  });
};

export const useCreateBudgetPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudgetPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetPeriods'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      toast.success('Presupuesto creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear presupuesto: ${error.message}`);
    },
  });
};

export const useUpdateBudgetPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateBudgetPeriod(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetPeriods'] });
      queryClient.invalidateQueries({ queryKey: ['budgetPeriod'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      toast.success('Presupuesto actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar presupuesto: ${error.message}`);
    },
  });
};

export const useDeleteBudgetPeriod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudgetPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgetPeriods'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      toast.success('Presupuesto eliminado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar presupuesto: ${error.message}`);
    },
  });
};
