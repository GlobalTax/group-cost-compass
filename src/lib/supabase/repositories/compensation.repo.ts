import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type CompensationBand = Database["public"]["Tables"]["compensation_bands"]["Row"];
type CompensationBandInsert = Database["public"]["Tables"]["compensation_bands"]["Insert"];
type CompensationBandUpdate = Database["public"]["Tables"]["compensation_bands"]["Update"];

/**
 * Obtener todas las bandas salariales activas
 */
export async function fetchCompensationBands(): Promise<CompensationBand[]> {
  const { data, error } = await supabase
    .from("compensation_bands")
    .select("*")
    .eq("is_active", true)
    .order("department", { ascending: true })
    .order("min_salary", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Obtener bandas salariales filtradas por departamento
 */
export async function fetchCompensationBandsByDepartment(
  department?: string
): Promise<CompensationBand[]> {
  let query = supabase
    .from("compensation_bands")
    .select("*")
    .eq("is_active", true)
    .order("level", { ascending: true });

  if (department) {
    query = query.eq("department", department);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/**
 * Obtener una banda salarial por ID
 */
export async function fetchCompensationBandById(id: string): Promise<CompensationBand | null> {
  const { data, error } = await supabase
    .from("compensation_bands")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Crear una nueva banda salarial
 */
export async function createCompensationBand(
  band: CompensationBandInsert
): Promise<CompensationBand> {
  const { data, error } = await supabase
    .from("compensation_bands")
    .insert(band)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualizar una banda salarial
 */
export async function updateCompensationBand(
  id: string,
  updates: CompensationBandUpdate
): Promise<CompensationBand> {
  const { data, error } = await supabase
    .from("compensation_bands")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Eliminar (desactivar) una banda salarial
 */
export async function deleteCompensationBand(id: string): Promise<void> {
  const { error } = await supabase
    .from("compensation_bands")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Obtener banda salarial recomendada para un nivel
 */
export async function getRecommendedBandForLevel(
  level: string
): Promise<CompensationBand | null> {
  const { data, error } = await supabase
    .from("compensation_bands")
    .select("*")
    .eq("level", level)
    .eq("is_active", true)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}
