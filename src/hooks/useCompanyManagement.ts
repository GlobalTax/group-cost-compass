import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCompany,
  updateCompany,
  deleteCompany,
  checkCompanyCanBeDeleted,
} from '@/lib/supabase/repositories/companies.repo';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (company: CompanyInsert) => createCompany(company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Empresa creada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear empresa: ${error.message}`);
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CompanyUpdate }) =>
      updateCompany(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Empresa actualizada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar empresa: ${error.message}`);
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const validation = await checkCompanyCanBeDeleted(id);
      if (!validation.canDelete) {
        throw new Error(validation.reason);
      }
      await deleteCompany(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Empresa eliminada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar empresa: ${error.message}`);
    },
  });
};

export const useCheckCompanyCanBeDeleted = () => {
  return useMutation({
    mutationFn: (id: string) => checkCompanyCanBeDeleted(id),
  });
};
