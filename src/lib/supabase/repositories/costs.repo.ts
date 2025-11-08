import { supabase } from '../client';
import type { Database } from '@/integrations/supabase/types';
import type { CostWithRelations, MonthlyCostSummary, YearOverYearComparison } from '../types/enriched';

type CostInsert = Database['public']['Tables']['hr_employee_costs']['Insert'];

// ============================================
// 1. UTILITY FUNCTIONS
// ============================================

/**
 * Check if costs already exist for given periods
 * Used during import to detect duplicates
 */
export const checkDuplicatePeriods = async (periods: string[]): Promise<boolean> => {
  const { data, error } = await supabase
    .from('hr_employee_costs')
    .select('period')
    .in('period', periods)
    .limit(1);

  if (error) {
    console.error('Error checking duplicate periods:', error);
    return false;
  }

  return !!data && data.length > 0;
};

// ============================================
// 2. QUERY BUILDERS (reutilizables)
// ============================================

/**
 * Build base query for costs with employee and company relations
 */
const buildCostsQueryWithRelations = () => {
  return supabase
    .from('hr_employee_costs')
    .select(`
      *,
      hr_employees (
        id,
        full_name,
        company_id,
        companies (
          id,
          name
        )
      )
    `);
};

export interface CostsFilters {
  employeeId?: string;
  companyId?: string;
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Apply filters to a costs query
 */
const applyCostsFilters = (
  query: ReturnType<typeof buildCostsQueryWithRelations>,
  filters: CostsFilters
) => {
  let filteredQuery = query;

  if (filters.employeeId) {
    filteredQuery = filteredQuery.eq('employee_id', filters.employeeId);
  }

  if (filters.year) {
    const startDate = filters.startDate || `${filters.year}-01-01`;
    const endDate = filters.endDate || `${filters.year}-12-31`;
    filteredQuery = filteredQuery.gte('period', startDate).lte('period', endDate);
  }

  if (filters.month && filters.year) {
    const period = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
    filteredQuery = filteredQuery.eq('period', period);
  }

  return filteredQuery.order('period', { ascending: false });
};

// ============================================
// 2. FETCH FUNCTIONS (ejecutan queries)
// ============================================

/**
 * Fetch costs with filters and relations
 * Reemplaza: useEmployeeCosts, useCostsByPeriod
 */
export const fetchCosts = async (filters: CostsFilters = {}): Promise<CostWithRelations[]> => {
  let query = buildCostsQueryWithRelations();
  query = applyCostsFilters(query, filters);

  const { data, error } = await query;
  
  if (error) throw error;
  return (data as CostWithRelations[]) || [];
};

/**
 * Fetch costs for dashboard stats (optimized: no full relations)
 */
export const fetchCostsForStats = async (filters: CostsFilters = {}): Promise<{
  bruto: number;
  coste_empresa: number;
  hr_employees: { company_id: string } | null;
}[]> => {
  let query = supabase
    .from('hr_employee_costs')
    .select(`
      bruto,
      coste_empresa,
      hr_employees (
        company_id
      )
    `);

  if (filters.year) {
    const startDate = `${filters.year}-01-01`;
    const endDate = `${filters.year}-12-31`;
    query = query.gte('period', startDate).lte('period', endDate);
  }

  // IMPORTANTE: Filtrar por company_id en la query, no en JS
  if (filters.companyId) {
    query = query.eq('hr_employees.company_id', filters.companyId);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
};

/**
 * Check if costs exist for a specific period
 */
export const checkExistingCosts = async (periods: string[]): Promise<boolean> => {
  const { data, error } = await supabase
    .from('hr_employee_costs')
    .select('id')
    .in('period', periods)
    .limit(1);
  
  if (error) throw error;
  return (data?.length || 0) > 0;
};

// ============================================
// 3. MUTATIONS (crear/actualizar)
// ============================================

/**
 * Create a single cost record
 */
export const createCost = async (cost: CostInsert) => {
  const { data, error } = await supabase
    .from('hr_employee_costs')
    .insert(cost)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Bulk create costs
 * Usado en imports desde CSV/A3Nom
 */
export const bulkCreateCosts = async (costs: CostInsert[]) => {
  const { data, error } = await supabase
    .from('hr_employee_costs')
    .insert(costs)
    .select();

  if (error) throw error;
  return data;
};

/**
 * Update a cost record
 */
export const updateCost = async (costId: string, updates: Partial<CostInsert>) => {
  const { data, error } = await supabase
    .from('hr_employee_costs')
    .update(updates)
    .eq('id', costId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Upsert a cost record (create or update)
 * Usado en entrada manual de nóminas
 */
export const upsertCost = async (cost: CostInsert) => {
  const { data, error } = await supabase
    .from('hr_employee_costs')
    .upsert(cost, { onConflict: 'employee_id,period' })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Bulk upsert costs (create or update multiple)
 */
export const bulkUpsertCosts = async (costs: CostInsert[]) => {
  const { data, error } = await supabase
    .from('hr_employee_costs')
    .upsert(costs, { onConflict: 'employee_id,period' })
    .select();

  if (error) throw error;
  return data;
};

/**
 * Delete costs by period and optional company filter
 * Usado para limpiar datos de un mes completo
 */
export const deleteCostsByPeriod = async (filters: {
  year: number;
  month: number;
  companyId?: string;
}) => {
  const period = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`;
  
  let query = supabase
    .from('hr_employee_costs')
    .delete()
    .eq('period', period);
  
  // Si se especifica empresa, filtrar por ella
  if (filters.companyId && filters.companyId !== 'all') {
    // Subconsulta para obtener employee_ids de esa empresa
    const { data: employeeIds } = await supabase
      .from('hr_employees')
      .select('id')
      .eq('company_id', filters.companyId);
    
    if (employeeIds && employeeIds.length > 0) {
      query = query.in('employee_id', employeeIds.map(e => e.id));
    } else {
      // No hay empleados de esa empresa, no borrar nada
      return { count: 0 };
    }
  }
  
  const { error, count } = await query;
  
  if (error) throw error;
  return { count: count || 0 };
};

// ============================================
// 4. TRANSFORMATIONS (lógica de negocio)
// ============================================

/**
 * Group costs by month
 * Usado en: useMonthlyCosts, useCostsAnalysis
 */
export const groupCostsByMonth = (costs: CostWithRelations[]): MonthlyCostSummary[] => {
  const monthlyMap = costs.reduce((acc, cost) => {
    const month = cost.period.substring(0, 7); // YYYY-MM
    
    if (!acc[month]) {
      acc[month] = {
        period: month,
        bruto: 0,
        coste: 0,
        employees: new Set<string>(),
      };
    }
    
    acc[month].bruto += cost.bruto || 0;
    acc[month].coste += cost.coste_empresa || 0;
    acc[month].employees.add(cost.employee_id);
    
    return acc;
  }, {} as Record<string, { period: string; bruto: number; coste: number; employees: Set<string> }>);

  return Object.values(monthlyMap).map(m => ({
    period: m.period,
    bruto: m.bruto,
    coste: m.coste,
    employees: m.employees.size,
  })).sort((a, b) => a.period.localeCompare(b.period));
};

/**
 * Calculate year-over-year comparison
 * Usado en: useDashboardStats
 */
export const calculateYearComparison = (
  currentYearCosts: { bruto: number; coste_empresa: number }[],
  previousYearCosts: { bruto: number; coste_empresa: number }[]
): YearOverYearComparison => {
  const currentBruto = currentYearCosts.reduce((sum, c) => sum + (c.bruto || 0), 0);
  const currentCoste = currentYearCosts.reduce((sum, c) => sum + (c.coste_empresa || 0), 0);
  
  const previousBruto = previousYearCosts.reduce((sum, c) => sum + (c.bruto || 0), 0);
  const previousCoste = previousYearCosts.reduce((sum, c) => sum + (c.coste_empresa || 0), 0);
  
  const brutoChange = currentBruto - previousBruto;
  const costeChange = currentCoste - previousCoste;
  
  const brutoChangePercent = previousBruto > 0 ? (brutoChange / previousBruto) * 100 : 0;
  const costeChangePercent = previousCoste > 0 ? (costeChange / previousCoste) * 100 : 0;

  return {
    currentYear: currentBruto,
    previousYear: previousBruto,
    brutoChange,
    costeChange,
    brutoChangePercent,
    costeChangePercent,
  };
};

/**
 * Calculate average cost per employee
 */
export const calculateAvgCostPerEmployee = (costs: { coste_empresa: number; employee_id: string }[]): number => {
  if (costs.length === 0) return 0;
  
  const totalCoste = costs.reduce((sum, c) => sum + (c.coste_empresa || 0), 0);
  const uniqueEmployees = new Set(costs.map(c => c.employee_id)).size;
  
  return uniqueEmployees > 0 ? totalCoste / uniqueEmployees : 0;
};

/**
 * Fetch personnel costs for budget period
 * Used by: BudgetPersonnelCostsTable component
 */
export const fetchBudgetPersonnelCosts = async (
  period: string,
  companyId?: string | null
) => {
  const endPeriod = new Date(new Date(period).setMonth(new Date(period).getMonth() + 1))
    .toISOString()
    .split('T')[0];

  let query = supabase
    .from("hr_employee_costs")
    .select(`
      id,
      period,
      bruto,
      coste_empresa,
      hr_employees (
        id,
        full_name,
        company_id
      )
    `)
    .gte("period", period)
    .lt("period", endPeriod)
    .order("coste_empresa", { ascending: false });

  if (companyId) {
    query = query.eq("hr_employees.company_id", companyId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

/**
 * Delete all employee costs (for bulk import)
 * CAUTION: This deletes ALL costs
 */
export const deleteAllCosts = async (): Promise<void> => {
  const { error } = await supabase
    .from('hr_employee_costs')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  
  if (error) throw error;
};

/**
 * Bulk insert employee costs
 */
export const bulkInsertCosts = async (costs: CostInsert[]): Promise<any[]> => {
  const { data, error } = await supabase
    .from('hr_employee_costs')
    .insert(costs)
    .select();
  
  if (error) throw error;
  return data || [];
};
