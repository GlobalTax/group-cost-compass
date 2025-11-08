/**
 * Repositorio para operaciones con roles de usuarios
 */

import { supabase } from "../client";
import type { AppRole } from "@/lib/auth";

/**
 * Assign role to user
 */
export const assignUserRole = async (roleData: {
  user_id: string;
  role: AppRole;
  org_id: string;
}) => {
  const { data, error } = await supabase
    .from('user_roles')
    .insert(roleData)
    .select()
    .single();
  
  if (error) {
    if (error.code === '23505') {
      throw new Error('El usuario ya tiene este rol asignado');
    }
    throw error;
  }
  return data;
};

/**
 * Revoke role from user
 */
export const revokeUserRole = async (userId: string, role: AppRole) => {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role);
  
  if (error) throw error;
};

/**
 * Fetch all user roles
 */
export const fetchUserRoles = async (): Promise<Array<{ user_id: string; role: AppRole }>> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id, role');
  
  if (error) throw error;
  return data || [];
};
