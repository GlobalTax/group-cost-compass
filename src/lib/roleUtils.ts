import type { AppRole } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

export interface RoleBadgeConfig {
  variant: 'destructive' | 'default' | 'success' | 'warning' | 'secondary' | 'purple';
  label: string;
}

export const roleConfig: Record<AppRole, RoleBadgeConfig> = {
  super_admin: { variant: 'destructive', label: 'Super Admin' },
  admin: { variant: 'default', label: 'Admin' },
  manager: { variant: 'success', label: 'Manager' },
  senior: { variant: 'warning', label: 'Senior' },
  junior: { variant: 'secondary', label: 'Junior' },
  finance: { variant: 'purple', label: 'Finance' },
};

export const allRoles: AppRole[] = [
  'super_admin',
  'admin',
  'manager',
  'senior',
  'junior',
  'finance',
];

export interface RoleValidationResult {
  valid: boolean;
  message?: string;
}

export const validateRoleChange = async (
  userId: string,
  currentUserId: string,
  action: 'assign' | 'revoke',
  role: AppRole
): Promise<RoleValidationResult> => {
  // No permitir auto-modificación de super_admin
  if (role === 'super_admin' && userId === currentUserId) {
    return {
      valid: false,
      message: 'No puedes modificar tu propio rol de super_admin',
    };
  }

  // Si se intenta revocar super_admin, verificar que haya más
  if (action === 'revoke' && role === 'super_admin') {
    const { count, error } = await supabase
      .from('user_roles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'super_admin');

    if (error) {
      return { valid: false, message: 'Error al validar roles' };
    }

    if (count !== null && count <= 1) {
      return {
        valid: false,
        message: 'Debe haber al menos un super_admin en el sistema',
      };
    }
  }

  return { valid: true };
};
