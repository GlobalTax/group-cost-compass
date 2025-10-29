import { supabase } from '@/lib/supabase/client';

// Tipos temporales hasta que se regeneren los tipos de Supabase
type BudgetPeriod = any;
type BudgetPeriodInsert = any;
type BudgetIncome = any;
type BudgetIncomeInsert = any;
type BudgetExpense = any;
type BudgetExpenseInsert = any;

// ============================================
// BUDGET PERIODS
// ============================================

export async function fetchBudgetPeriods(filters?: {
  year?: number;
  companyId?: string;
  status?: string;
}) {
  let query = (supabase as any)
    .from('budget_periods')
    .select('*, companies(id, name)')
    .order('period', { ascending: false });

  if (filters?.year) {
    const startDate = `${filters.year}-01-01`;
    const endDate = `${filters.year}-12-31`;
    query = query.gte('period', startDate).lte('period', endDate);
  }

  if (filters?.companyId && filters.companyId !== 'all') {
    query = query.eq('company_id', filters.companyId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchBudgetPeriodById(id: string) {
  const { data, error } = await (supabase as any)
    .from('budget_periods')
    .select('*, companies(id, name)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createBudgetPeriod(period: BudgetPeriodInsert) {
  const { data, error } = await (supabase as any)
    .from('budget_periods')
    .insert(period)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBudgetPeriod(id: string, updates: Partial<BudgetPeriodInsert>) {
  const { data, error } = await (supabase as any)
    .from('budget_periods')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBudgetPeriod(id: string) {
  const { error } = await (supabase as any)
    .from('budget_periods')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// BUDGET INCOME
// ============================================

export async function fetchBudgetIncome(budgetPeriodId: string) {
  const { data, error } = await (supabase as any)
    .from('budget_income')
    .select('*')
    .eq('budget_period_id', budgetPeriodId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createBudgetIncome(income: BudgetIncomeInsert) {
  const { data, error } = await (supabase as any)
    .from('budget_income')
    .insert(income)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBudgetIncome(id: string, updates: Partial<BudgetIncomeInsert>) {
  const { data, error } = await (supabase as any)
    .from('budget_income')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBudgetIncome(id: string) {
  const { error } = await (supabase as any)
    .from('budget_income')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// BUDGET EXPENSES
// ============================================

export async function fetchBudgetExpenses(budgetPeriodId: string) {
  const { data, error } = await (supabase as any)
    .from('budget_expenses')
    .select('*')
    .eq('budget_period_id', budgetPeriodId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createBudgetExpense(expense: BudgetExpenseInsert) {
  const { data, error } = await (supabase as any)
    .from('budget_expenses')
    .insert(expense)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBudgetExpense(id: string, updates: Partial<BudgetExpenseInsert>) {
  const { data, error } = await (supabase as any)
    .from('budget_expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBudgetExpense(id: string) {
  const { error } = await (supabase as any)
    .from('budget_expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// BUDGET SUMMARY VIEW
// ============================================

export async function fetchBudgetSummary(filters?: {
  year?: number;
  companyId?: string;
}) {
  let query = (supabase as any)
    .from('vw_budget_summary')
    .select('*')
    .order('period', { ascending: false });

  if (filters?.year) {
    const startDate = `${filters.year}-01-01`;
    const endDate = `${filters.year}-12-31`;
    query = query.gte('period', startDate).lte('period', endDate);
  }

  if (filters?.companyId && filters.companyId !== 'all') {
    query = query.eq('company_id', filters.companyId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}
