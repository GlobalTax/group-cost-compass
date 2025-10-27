import { supabase } from '../client';
import type { Company } from '../types/enriched';
import type { Database } from '@/integrations/supabase/types';

type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

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

/**
 * Create a new company
 */
export const createCompany = async (company: CompanyInsert): Promise<Company> => {
  const { data, error } = await supabase
    .from('companies')
    .insert(company)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Update an existing company
 */
export const updateCompany = async (id: string, updates: CompanyUpdate): Promise<Company> => {
  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Delete a company
 */
export const deleteCompany = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

/**
 * Check if a company can be deleted (no active employees)
 */
export const checkCompanyCanBeDeleted = async (id: string): Promise<{ canDelete: boolean; reason?: string; employeeCount?: number }> => {
  // Check for active employees
  const { count, error } = await supabase
    .from('hr_employees')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', id);
  
  if (error) throw error;
  
  const employeeCount = count || 0;
  
  if (employeeCount > 0) {
    return {
      canDelete: false,
      reason: `La empresa tiene ${employeeCount} empleado${employeeCount > 1 ? 's' : ''} asociado${employeeCount > 1 ? 's' : ''}`,
      employeeCount,
    };
  }
  
  return { canDelete: true };
};
