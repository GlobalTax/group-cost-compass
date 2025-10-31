import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Deal = Database["public"]["Tables"]["deals"]["Row"];
type DealInsert = Database["public"]["Tables"]["deals"]["Insert"];
type DealUpdate = Database["public"]["Tables"]["deals"]["Update"];
type DealParticipant = Database["public"]["Tables"]["deal_participants"]["Row"];
type DealParticipantInsert = Database["public"]["Tables"]["deal_participants"]["Insert"];

export interface DealWithParticipants extends Deal {
  participants: (DealParticipant & {
    employee: {
      id: string;
      full_name: string;
      compensation_level: string | null;
    };
  })[];
  lead_partner: {
    id: string;
    full_name: string;
  } | null;
}

/**
 * Obtener deals con filtros opcionales
 */
export async function fetchDeals(filters?: {
  status?: string;
  fiscalYear?: number;
}): Promise<DealWithParticipants[]> {
  let query = supabase
    .from("deals")
    .select(`
      *,
      lead_partner:hr_employees!lead_partner_id(id, full_name),
      participants:deal_participants(
        *,
        employee:hr_employees(id, full_name, compensation_level)
      )
    `)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.fiscalYear) {
    query = query.eq("fiscal_year", filters.fiscalYear);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as DealWithParticipants[];
}

/**
 * Obtener un deal por ID con participantes
 */
export async function fetchDealById(id: string): Promise<DealWithParticipants | null> {
  const { data, error } = await supabase
    .from("deals")
    .select(`
      *,
      lead_partner:hr_employees!lead_partner_id(id, full_name),
      participants:deal_participants(
        *,
        employee:hr_employees(id, full_name, compensation_level)
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as DealWithParticipants;
}

/**
 * Crear un nuevo deal
 */
export async function createDeal(deal: DealInsert): Promise<Deal> {
  const { data, error } = await supabase
    .from("deals")
    .insert(deal)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualizar un deal
 */
export async function updateDeal(id: string, updates: DealUpdate): Promise<Deal> {
  const { data, error } = await supabase
    .from("deals")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Eliminar un deal
 */
export async function deleteDeal(id: string): Promise<void> {
  const { error } = await supabase.from("deals").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Añadir participante a un deal
 */
export async function addDealParticipant(
  participant: DealParticipantInsert
): Promise<DealParticipant> {
  const { data, error } = await supabase
    .from("deal_participants")
    .insert(participant)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualizar participante de un deal
 */
export async function updateDealParticipant(
  id: string,
  updates: { participation_pct?: number; role_in_deal?: string }
): Promise<DealParticipant> {
  const { data, error } = await supabase
    .from("deal_participants")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Eliminar participante de un deal
 */
export async function removeDealParticipant(id: string): Promise<void> {
  const { error } = await supabase.from("deal_participants").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Obtener deals de un empleado
 */
export async function fetchEmployeeDeals(employeeId: string): Promise<DealWithParticipants[]> {
  const { data, error } = await supabase
    .from("deal_participants")
    .select(`
      deal:deals(
        *,
        lead_partner:hr_employees!lead_partner_id(id, full_name),
        participants:deal_participants(
          *,
          employee:hr_employees(id, full_name, compensation_level)
        )
      )
    `)
    .eq("employee_id", employeeId);

  if (error) throw error;
  return (data?.map((item) => item.deal).filter(Boolean) as DealWithParticipants[]) || [];
}
