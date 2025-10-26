import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { InviteUserInput } from '@/lib/validators/userSchema';

export const useInviteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, role }: InviteUserInput) => {
      // 1. Verificar que el email no existe
      const { data: existingData, error: listError } = await supabase.auth.admin.listUsers();
      
      if (listError) {
        throw new Error('Error al verificar usuarios existentes');
      }

      const existingUsers = existingData?.users || [];
      if (existingUsers.some(u => u.email?.toLowerCase() === email.toLowerCase())) {
        throw new Error('El usuario ya existe en el sistema');
      }

      // 2. Invitar usuario (envía email automático con link para establecer contraseña)
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
      
      if (error) throw error;
      if (!data.user) throw new Error('No se pudo crear el usuario');

      // 3. Asignar rol inicial automáticamente (org_id puede ser null)
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: data.user.id,
        role,
        org_id: null, // Se puede asignar después si es necesario
      });

      if (roleError) {
        // Intentar limpiar el usuario si falla la asignación de rol
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new Error('Error al asignar rol inicial');
      }

      return data;
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
      // 1. Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (userId === user?.id) {
        throw new Error('No puedes eliminarte a ti mismo');
      }

      // 2. Verificar si es super_admin y si es el último
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      const isSuperAdmin = userRoles?.some(r => r.role === 'super_admin');

      if (isSuperAdmin) {
        const { count } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'super_admin');

        if (count !== null && count <= 1) {
          throw new Error('No se puede eliminar el último super_admin del sistema');
        }
      }

      // 3. Eliminar usuario (los roles se eliminan automáticamente por CASCADE)
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
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
