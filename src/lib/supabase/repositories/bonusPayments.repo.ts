import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type BonusPayment = Database["public"]["Tables"]["bonus_payments"]["Row"];
type BonusPaymentInsert = Database["public"]["Tables"]["bonus_payments"]["Insert"];

export interface BonusPaymentWithDetails extends BonusPayment {
  employee: {
    id: string;
    full_name: string;
  };
  deal: {
    id: string;
    deal_name: string;
  } | null;
}

/**
 * Obtener pagos de bonus con filtros opcionales
 */
export async function fetchBonusPayments(filters?: {
  employeeId?: string;
  fiscalYear?: number;
}): Promise<BonusPaymentWithDetails[]> {
  let query = supabase
    .from("bonus_payments")
    .select(`
      *,
      employee:hr_employees(id, full_name),
      deal:deals(id, deal_name)
    `)
    .order("payment_date", { ascending: false });

  if (filters?.employeeId) {
    query = query.eq("employee_id", filters.employeeId);
  }

  if (filters?.fiscalYear) {
    query = query.eq("fiscal_year", filters.fiscalYear);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as BonusPaymentWithDetails[];
}

/**
 * Crear un nuevo pago de bonus
 */
export async function createBonusPayment(
  payment: BonusPaymentInsert
): Promise<BonusPayment> {
  const { data, error } = await supabase
    .from("bonus_payments")
    .insert(payment)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtener total de bonus de un empleado en un año
 */
export async function fetchEmployeeTotalBonus(
  employeeId: string,
  fiscalYear: number
): Promise<number> {
  const { data, error } = await supabase
    .from("bonus_payments")
    .select("amount")
    .eq("employee_id", employeeId)
    .eq("fiscal_year", fiscalYear);

  if (error) throw error;

  return data?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
}

/**
 * Obtener resumen de bonus por tipo
 */
export async function fetchBonusSummaryByType(
  employeeId: string,
  fiscalYear: number
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("bonus_payments")
    .select("bonus_type, amount")
    .eq("employee_id", employeeId)
    .eq("fiscal_year", fiscalYear);

  if (error) throw error;

  const summary: Record<string, number> = {};
  data?.forEach((payment) => {
    summary[payment.bonus_type] = (summary[payment.bonus_type] || 0) + Number(payment.amount);
  });

  return summary;
}

/**
 * Eliminar un pago de bonus
 */
export async function deleteBonusPayment(id: string): Promise<void> {
  const { error } = await supabase.from("bonus_payments").delete().eq("id", id);
  if (error) throw error;
}
