import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type PerformanceReview = Database["public"]["Tables"]["performance_reviews"]["Row"];
type PerformanceReviewInsert = Database["public"]["Tables"]["performance_reviews"]["Insert"];
type PerformanceReviewUpdate = Database["public"]["Tables"]["performance_reviews"]["Update"];

export interface PerformanceReviewWithDetails extends PerformanceReview {
  employee: {
    id: string;
    full_name: string;
  };
  reviewer: {
    id: string;
    full_name: string;
  } | null;
}

/**
 * Obtener evaluaciones de desempeño de un empleado
 */
export async function fetchPerformanceReviews(
  employeeId?: string
): Promise<PerformanceReviewWithDetails[]> {
  let query = supabase
    .from("performance_reviews")
    .select(`
      *,
      employee:hr_employees!performance_reviews_employee_id_fkey(id, full_name),
      reviewer:hr_employees!performance_reviews_reviewer_id_fkey(id, full_name)
    `)
    .order("review_date", { ascending: false });

  if (employeeId) {
    query = query.eq("employee_id", employeeId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as PerformanceReviewWithDetails[];
}

/**
 * Obtener una evaluación por ID
 */
export async function fetchPerformanceReviewById(
  id: string
): Promise<PerformanceReviewWithDetails | null> {
  const { data, error } = await supabase
    .from("performance_reviews")
    .select(`
      *,
      employee:hr_employees!performance_reviews_employee_id_fkey(id, full_name),
      reviewer:hr_employees!performance_reviews_reviewer_id_fkey(id, full_name)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as PerformanceReviewWithDetails;
}

/**
 * Crear una nueva evaluación de desempeño
 */
export async function createPerformanceReview(
  review: PerformanceReviewInsert
): Promise<PerformanceReview> {
  const { data, error } = await supabase
    .from("performance_reviews")
    .insert(review)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualizar una evaluación de desempeño
 */
export async function updatePerformanceReview(
  id: string,
  updates: PerformanceReviewUpdate
): Promise<PerformanceReview> {
  const { data, error } = await supabase
    .from("performance_reviews")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Eliminar una evaluación de desempeño
 */
export async function deletePerformanceReview(id: string): Promise<void> {
  const { error } = await supabase.from("performance_reviews").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Obtener la última evaluación de un empleado
 */
export async function fetchLatestPerformanceReview(
  employeeId: string
): Promise<PerformanceReviewWithDetails | null> {
  const { data, error } = await supabase
    .from("performance_reviews")
    .select(`
      *,
      employee:hr_employees!performance_reviews_employee_id_fkey(id, full_name),
      reviewer:hr_employees!performance_reviews_reviewer_id_fkey(id, full_name)
    `)
    .eq("employee_id", employeeId)
    .order("review_date", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as PerformanceReviewWithDetails;
}
