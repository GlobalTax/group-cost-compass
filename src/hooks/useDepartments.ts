import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchDepartments,
  fetchDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  checkDepartmentCanBeDeleted,
} from '@/lib/supabase/repositories/departments.repo';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type DepartmentInsert = Database['public']['Tables']['departments']['Insert'];
type DepartmentUpdate = Database['public']['Tables']['departments']['Update'];

export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};

export const useDepartment = (id: string) => {
  return useQuery({
    queryKey: ['departments', id],
    queryFn: () => fetchDepartmentById(id),
    enabled: !!id,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (department: DepartmentInsert) => createDepartment(department),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Departamento creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear departamento: ${error.message}`);
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: DepartmentUpdate }) =>
      updateDepartment(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Departamento actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar departamento: ${error.message}`);
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const validation = await checkDepartmentCanBeDeleted(id);
      if (!validation.canDelete) {
        throw new Error(validation.reason);
      }
      await deleteDepartment(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Departamento eliminado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};
