import { supabase } from '../client';
import type { RoleConfiguration } from '../types/enriched';
import type { Database } from '@/integrations/supabase/types';

type RoleConfigUpdate = Database['public']['Tables']['role_configurations']['Update'];

/**
 * Fetch all role configurations
 */
export const fetchRoleConfigurations = async (): Promise<RoleConfiguration[]> => {
  const { data, error } = await supabase
    .from('role_configurations')
    .select('*')
    .order('role');
  
  if (error) throw error;
  return data || [];
};

/**
 * Fetch a single role configuration by role name
 */
export const fetchRoleConfigByRole = async (role: string): Promise<RoleConfiguration | null> => {
  const { data, error } = await supabase
    .from('role_configurations')
    .select('*')
    .eq('role', role)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data;
};

/**
 * Update a role configuration
 */
export const updateRoleConfiguration = async (
  id: string,
  updates: RoleConfigUpdate
): Promise<RoleConfiguration> => {
  const { data, error } = await supabase
    .from('role_configurations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};
