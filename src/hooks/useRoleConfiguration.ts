import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRoleConfigurations,
  fetchRoleConfigByRole,
  updateRoleConfiguration,
} from '@/lib/supabase/repositories/roleConfig.repo';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type RoleConfigUpdate = Database['public']['Tables']['role_configurations']['Update'];

export const useRoleConfigurations = () => {
  return useQuery({
    queryKey: ['role-configurations'],
    queryFn: fetchRoleConfigurations,
    staleTime: 300000, // 5 minutos
    refetchOnWindowFocus: false,
  });
};

export const useRoleConfigByRole = (role: string) => {
  return useQuery({
    queryKey: ['role-configuration', role],
    queryFn: () => fetchRoleConfigByRole(role),
    enabled: !!role,
    staleTime: 300000,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateRoleConfiguration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: RoleConfigUpdate }) =>
      updateRoleConfiguration(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role-configurations'] });
      toast.success('Configuración de rol actualizada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar configuración: ${error.message}`);
    },
  });
};
