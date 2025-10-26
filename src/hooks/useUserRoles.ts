import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AppRole } from '@/lib/auth';
import type { AssignRoleInput, RevokeRoleInput } from '@/lib/validators/rolesSchema';
import { validateRoleChange } from '@/lib/roleUtils';

export interface UserWithRoles {
  id: string;
  email: string;
  roles: AppRole[];
  created_at: string;
}

export interface RoleAuditLog {
  id: string;
  user_id: string;
  role: AppRole;
  action: 'assigned' | 'revoked';
  performed_by: string;
  created_at: string;
  user_email?: string;
  performer_email?: string;
}

export const useUsersWithRoles = () => {
  return useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      const { data, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) throw usersError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRoles[] = (data?.users || []).map((user) => ({
        id: user.id,
        email: user.email!,
        roles: roles?.filter((r) => r.user_id === user.id).map((r) => r.role as AppRole) || [],
        created_at: user.created_at,
      }));

      return usersWithRoles;
    },
    staleTime: 30000,
  });
};

export const useAssignRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role, orgId }: AssignRoleInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const validation = await validateRoleChange(userId, user.id, 'assign', role);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      const { error } = await supabase.from('user_roles').insert({
        user_id: userId,
        role,
        org_id: orgId,
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error('El usuario ya tiene este rol asignado');
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles-audit'] });
      toast.success('Rol asignado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al asignar rol');
    },
  });
};

export const useRevokeRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: RevokeRoleInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      const validation = await validateRoleChange(userId, user.id, 'revoke', role);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles-audit'] });
      toast.success('Rol revocado correctamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al revocar rol');
    },
  });
};

export const useRolesAudit = () => {
  return useQuery({
    queryKey: ['roles-audit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles_audit')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const { data: usersData } = await supabase.auth.admin.listUsers();
      const users = usersData?.users || [];

      const enrichedData: RoleAuditLog[] = data.map((log) => ({
        id: log.id,
        user_id: log.user_id,
        role: log.role as AppRole,
        action: log.action as 'assigned' | 'revoked',
        performed_by: log.performed_by || '',
        created_at: log.created_at,
        user_email: users.find((u) => u.id === log.user_id)?.email,
        performer_email: users.find((u) => u.id === log.performed_by)?.email,
      }));

      return enrichedData;
    },
    staleTime: 60000,
  });
};

export const useRoleStats = () => {
  return useQuery({
    queryKey: ['role-stats'],
    queryFn: async () => {
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const { data: roles } = await supabase.from('user_roles').select('user_id, role');

      const totalUsers = usersData?.users?.length || 0;
      const usersWithRoles = new Set(roles?.map((r) => r.user_id) || []).size;
      const usersWithoutRoles = totalUsers - usersWithRoles;

      const superAdmins = roles?.filter((r) => r.role === 'super_admin').length || 0;
      const admins = roles?.filter((r) => r.role === 'admin').length || 0;

      return {
        totalUsers,
        usersWithRoles,
        usersWithoutRoles,
        superAdmins,
        admins,
      };
    },
    staleTime: 30000,
  });
};
