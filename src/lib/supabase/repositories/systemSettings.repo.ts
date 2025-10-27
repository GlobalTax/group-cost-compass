import { supabase } from '../client';
import type { SystemSetting } from '../types/enriched';
import type { Database } from '@/integrations/supabase/types';

type SystemSettingInsert = Database['public']['Tables']['system_settings']['Insert'];
type SystemSettingUpdate = Database['public']['Tables']['system_settings']['Update'];

/**
 * Fetch all system settings for current org
 */
export const fetchSystemSettings = async (orgId: string): Promise<SystemSetting[]> => {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .eq('org_id', orgId)
    .order('setting_category', { ascending: true })
    .order('setting_key', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

/**
 * Fetch a single setting by key
 */
export const fetchSettingByKey = async (
  orgId: string,
  key: string
): Promise<SystemSetting | null> => {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .eq('org_id', orgId)
    .eq('setting_key', key)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  
  return data;
};

/**
 * Create or update a system setting
 */
export const upsertSystemSetting = async (
  setting: SystemSettingInsert
): Promise<SystemSetting> => {
  const { data, error } = await supabase
    .from('system_settings')
    .upsert(setting, {
      onConflict: 'org_id,setting_key',
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Update a system setting
 */
export const updateSystemSetting = async (
  id: string,
  updates: SystemSettingUpdate
): Promise<SystemSetting> => {
  const { data, error } = await supabase
    .from('system_settings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Delete a system setting
 */
export const deleteSystemSetting = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('system_settings')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
