import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type AllocationTemplate = Database['public']['Tables']['revenue_allocation_templates']['Row'];
type AllocationTemplateInsert = Database['public']['Tables']['revenue_allocation_templates']['Insert'];
type AllocationTemplateUpdate = Database['public']['Tables']['revenue_allocation_templates']['Update'];

type AllocationTemplateItem = Database['public']['Tables']['revenue_allocation_template_items']['Row'];
type AllocationTemplateItemInsert = Database['public']['Tables']['revenue_allocation_template_items']['Insert'];

// ============= TEMPLATES =============

export async function fetchAllocationTemplates() {
  const { data, error } = await supabase
    .from("revenue_allocation_templates")
    .select(`
      *,
      revenue_allocation_template_items (
        id,
        employee_id,
        team_id,
        allocation_percentage,
        allocation_type,
        notes,
        display_order,
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
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function fetchAllocationTemplateById(id: string) {
  const { data, error } = await supabase
    .from("revenue_allocation_templates")
    .select(`
      *,
      revenue_allocation_template_items (
        id,
        employee_id,
        team_id,
        allocation_percentage,
        allocation_type,
        notes,
        display_order,
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

export async function createAllocationTemplate(data: AllocationTemplateInsert) {
  const { data: result, error } = await supabase
    .from("revenue_allocation_templates")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateAllocationTemplate(id: string, data: AllocationTemplateUpdate) {
  const { data: result, error } = await supabase
    .from("revenue_allocation_templates")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function deleteAllocationTemplate(id: string) {
  const { error } = await supabase
    .from("revenue_allocation_templates")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

// ============= TEMPLATE ITEMS =============

export async function createTemplateItem(data: AllocationTemplateItemInsert) {
  const { data: result, error } = await supabase
    .from("revenue_allocation_template_items")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function bulkCreateTemplateItems(items: AllocationTemplateItemInsert[]) {
  const { data, error } = await supabase
    .from("revenue_allocation_template_items")
    .insert(items)
    .select();

  if (error) throw error;
  return data;
}

export async function deleteTemplateItem(id: string) {
  const { error } = await supabase
    .from("revenue_allocation_template_items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function deleteTemplateItemsByTemplateId(templateId: string) {
  const { error } = await supabase
    .from("revenue_allocation_template_items")
    .delete()
    .eq("template_id", templateId);

  if (error) throw error;
}

// ============= TRANSACTIONAL OPERATIONS =============

/**
 * Crea un template completo con sus items en una sola operación
 */
export async function createTemplateWithItems(
  templateData: AllocationTemplateInsert,
  items: Omit<AllocationTemplateItemInsert, 'template_id'>[]
) {
  // 1. Crear el template
  const template = await createAllocationTemplate(templateData);

  // 2. Crear los items asociados
  const itemsToInsert = items.map((item, index) => ({
    ...item,
    template_id: template.id,
    display_order: item.display_order ?? index,
  }));

  const templateItems = await bulkCreateTemplateItems(itemsToInsert);

  return { template, items: templateItems };
}

/**
 * Aplica un template a un revenue_item específico
 * Crea todas las allocations basándose en el template
 */
export async function applyTemplateToRevenue(
  templateId: string,
  revenueItemId: string,
  totalAmount: number
) {
  // 1. Obtener template con sus items
  const template = await fetchAllocationTemplateById(templateId);

  if (!template.revenue_allocation_template_items || template.revenue_allocation_template_items.length === 0) {
    throw new Error("El template no tiene asignaciones definidas");
  }

  // 2. Crear allocations basadas en los items del template
  const allocationsToCreate = template.revenue_allocation_template_items.map(item => ({
    revenue_item_id: revenueItemId,
    employee_id: item.employee_id,
    team_id: item.team_id,
    allocation_percentage: item.allocation_percentage,
    allocated_amount: (totalAmount * (item.allocation_percentage || 0)) / 100,
    allocation_type: item.allocation_type,
    notes: item.notes,
  }));

  // 3. Insertar las allocations
  const { data, error } = await supabase
    .from("revenue_allocations")
    .insert(allocationsToCreate)
    .select();

  if (error) throw error;
  return data;
}
