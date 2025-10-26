import { supabase } from '../client';
import type { Company } from '../types/enriched';

/**
 * Fetch all companies ordered by name
 */
export const fetchCompanies = async (): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};

/**
 * Fetch a single company by ID
 */
export const fetchCompanyById = async (id: string): Promise<Company | null> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return data;
};

/**
 * Search companies by name (case-insensitive)
 */
export const searchCompaniesByName = async (query: string): Promise<Company[]> => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(10);
  
  if (error) throw error;
  return data || [];
};
