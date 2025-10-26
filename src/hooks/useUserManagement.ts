import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { InviteUserInput } from '@/lib/validators/userSchema';

export const useInviteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, role }: InviteUserInput) => {
      // 1. Obtener sesión actual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No autenticado');
      }

      // 2. Verificar que email no existe (usando edge function)
      const { data: usersResponse } = await supabase.functions.invoke('list-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const existingUsers = usersResponse?.users || [];
      if (existingUsers.some((u: any) => u.email?.toLowerCase() === email.toLowerCase())) {
        throw new Error('El usuario ya existe en el sistema');
      }

      // 3. Invitar usuario (usando edge function que usa service_role)
      const { data: inviteResponse, error: inviteError } = await supabase.functions.invoke('invite-user', {
        body: { email, role },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (inviteError) throw inviteError;
      if (!inviteResponse?.user) throw new Error('No se pudo crear el usuario');

      return inviteResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-stats'] });
      toast.success('Invitación enviada correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al invitar usuario');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      // Obtener sesión actual
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No autenticado');
      }

      // Llamar a edge function para eliminar usuario
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['role-stats'] });
      toast.success('Usuario eliminado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar usuario');
    },
  });
};
