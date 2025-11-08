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

/**
 * Fetch company metrics (employees, costs, transfers)
 * Used by: CompanyDrawer component
 */
export const fetchCompanyMetrics = async (companyId: string, year?: number) => {
  const currentYear = year || new Date().getFullYear();
  const startDate = `${currentYear}-01-01`;
  const endDate = `${currentYear}-12-31`;

  // Parallel queries for performance
  const [company, employees, costs, prevCosts, transfers] = await Promise.all([
    // Query 1: Company info
    supabase.from("companies").select("*").eq("id", companyId).single(),
    
    // Query 2: Active employees
    supabase.from("hr_employees")
      .select("*", { count: "exact" })
      .eq("company_id", companyId)
      .is("termination_date", null),
    
    // Query 3: Current year costs
    supabase.from("hr_employee_costs")
      .select("bruto, coste_empresa, hr_employees!inner(company_id)")
      .eq("hr_employees.company_id", companyId)
      .gte("period", startDate)
      .lte("period", endDate),
    
    // Query 4: Previous year costs (for comparison)
    supabase.from("hr_employee_costs")
      .select("bruto, hr_employees!inner(company_id)")
      .eq("hr_employees.company_id", companyId)
      .gte("period", `${currentYear - 1}-01-01`)
      .lte("period", `${currentYear - 1}-12-31`),
    
    // Query 5: Transfers
    supabase.from("hr_transfers")
      .select(`
        *,
        hr_employees!inner(id, full_name),
        from_company:companies!hr_transfers_from_company_fkey(id, name),
        to_company:companies!hr_transfers_to_company_fkey(id, name)
      `)
      .or(`from_company_id.eq.${companyId},to_company_id.eq.${companyId}`)
      .order("transfer_date", { ascending: false })
  ]);

  if (company.error) throw company.error;
  if (employees.error) throw employees.error;
  if (costs.error) throw costs.error;
  if (prevCosts.error) throw prevCosts.error;
  if (transfers.error) throw transfers.error;

  // Calculate metrics
  const totalBruto = costs.data?.reduce((sum, c) => sum + (c.bruto || 0), 0) || 0;
  const totalCoste = costs.data?.reduce((sum, c) => sum + (c.coste_empresa || 0), 0) || 0;
  const prevBruto = prevCosts.data?.reduce((sum, c) => sum + (c.bruto || 0), 0) || 0;
  const salaryIncreasePercent = prevBruto > 0 ? ((totalBruto - prevBruto) / prevBruto) * 100 : 0;

  return {
    ...company.data,
    activeEmployees: employees.count || 0,
    totalBruto,
    totalCoste,
    salaryIncreasePercent,
    employees: employees.data || [],
    transfers: transfers.data || [],
  };
};
