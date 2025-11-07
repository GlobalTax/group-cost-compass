import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type RevenueItem = Database['public']['Tables']['revenue_items']['Row'];
type RevenueItemInsert = Database['public']['Tables']['revenue_items']['Insert'];
type RevenueItemUpdate = Database['public']['Tables']['revenue_items']['Update'];

type RevenueAllocation = Database['public']['Tables']['revenue_allocations']['Row'];
type RevenueAllocationInsert = Database['public']['Tables']['revenue_allocations']['Insert'];

// ============= REVENUE ITEMS =============

export async function fetchRevenueItems(filters?: {
  year?: number;
  companyId?: string;
  isRecurring?: boolean;
}) {
  let query = supabase
    .from("revenue_items")
    .select(`
      *,
      companies:company_id (
        id,
        name,
        nif
      ),
      revenue_allocations (
        id,
        employee_id,
        team_id,
        allocated_amount,
        allocation_percentage,
        allocation_type,
        hr_employees:employee_id (
          id,
          full_name
        ),
        teams:team_id (
          id,
          name
        )
      )
    `)
    .order("period", { ascending: false });

  if (filters?.year) {
    const startDate = `${filters.year}-01-01`;
    const endDate = `${filters.year}-12-31`;
    query = query.gte("period", startDate).lte("period", endDate);
  }

  if (filters?.companyId) {
    query = query.eq("company_id", filters.companyId);
  }

  if (filters?.isRecurring !== undefined) {
    query = query.eq("is_recurring", filters.isRecurring);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function fetchRevenueItemById(id: string) {
  const { data, error } = await supabase
    .from("revenue_items")
    .select(`
      *,
      companies:company_id (
        id,
        name,
        nif
      ),
      revenue_allocations (
        id,
        employee_id,
        team_id,
        allocated_amount,
        allocation_percentage,
        allocation_type,
        notes,
        hr_employees:employee_id (
          id,
          full_name
        ),
        teams:team_id (
          id,
          name
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createRevenueItem(data: RevenueItemInsert) {
  const { data: result, error } = await supabase
    .from("revenue_items")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateRevenueItem(id: string, data: RevenueItemUpdate) {
  const { data: result, error } = await supabase
    .from("revenue_items")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function deleteRevenueItem(id: string) {
  const { error } = await supabase
    .from("revenue_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ============= REVENUE ALLOCATIONS =============

export async function fetchRevenueAllocations(revenueItemId: string) {
  const { data, error } = await supabase
    .from("revenue_allocations")
    .select(`
      *,
      hr_employees:employee_id (
        id,
        full_name
      ),
      teams:team_id (
        id,
        name
      )
    `)
    .eq("revenue_item_id", revenueItemId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createRevenueAllocation(data: RevenueAllocationInsert) {
  const { data: result, error } = await supabase
    .from("revenue_allocations")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function bulkCreateRevenueAllocations(allocations: RevenueAllocationInsert[]) {
  const { data, error } = await supabase
    .from("revenue_allocations")
    .insert(allocations)
    .select();

  if (error) throw error;
  return data;
}

export async function deleteRevenueAllocation(id: string) {
  const { error } = await supabase
    .from("revenue_allocations")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function bulkApplyAllocations(
  revenueItemIds: string[],
  allocations: RevenueAllocationInsert[]
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado");
  
  const { data: userData } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single();
  
  if (!userData?.org_id) throw new Error("Organización no encontrada");

  const allAllocations: RevenueAllocationInsert[] = [];
  
  for (const itemId of revenueItemIds) {
    for (const alloc of allocations) {
      allAllocations.push({
        ...alloc,
        revenue_item_id: itemId,
        org_id: userData.org_id,
      });
    }
  }

  const { data, error } = await supabase
    .from("revenue_allocations")
    .insert(allAllocations)
    .select();

  if (error) throw error;
  return data;
}

// ============= ANALYTICS =============

export async function fetchRevenueAnalytics(filters?: {
  year?: number;
  companyId?: string;
}) {
  let query = supabase
    .from("revenue_items")
    .select("period, total_amount, is_recurring, company_id");

  if (filters?.year) {
    const startDate = `${filters.year}-01-01`;
    const endDate = `${filters.year}-12-31`;
    query = query.gte("period", startDate).lte("period", endDate);
  }

  if (filters?.companyId) {
    query = query.eq("company_id", filters.companyId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}
