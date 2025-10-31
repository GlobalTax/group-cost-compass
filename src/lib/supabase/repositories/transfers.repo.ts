/**
 * Repositorio para operaciones con transferencias de empleados
 */

import { supabase } from "../client";
import type { Database } from "@/integrations/supabase/types";

type Transfer = Database["public"]["Tables"]["hr_transfers"]["Row"];
type TransferInsert = Database["public"]["Tables"]["hr_transfers"]["Insert"];

/**
 * Obtiene transferencias con filtros opcionales
 */
export const fetchTransfers = async (filters?: {
  employeeId?: string;
  fromCompanyId?: string;
  toCompanyId?: string;
}): Promise<any[]> => {
  let query: any = supabase
    .from("hr_transfers")
    .select(
      `
      *,
      employee:hr_employees(id, full_name),
      from_company:companies!hr_transfers_from_company_id_fkey(id, name),
      to_company:companies!hr_transfers_to_company_id_fkey(id, name)
    `
    )
    .order("transfer_date", { ascending: false });

  if (filters?.employeeId) {
    query = query.eq("employee_id", filters.employeeId);
  }

  if (filters?.fromCompanyId) {
    query = query.eq("from_company_id", filters.fromCompanyId);
  }

  if (filters?.toCompanyId) {
    query = query.eq("to_company_id", filters.toCompanyId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

/**
 * Crea una nueva transferencia
 */
export const createTransfer = async (data: TransferInsert): Promise<Transfer> => {
  const { data: transfer, error } = await supabase
    .from("hr_transfers")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return transfer;
};

/**
 * Detecta transferencias automáticamente basándose en cambios de empresa
 * 
 * @deprecated Usar detectPotentialTransfers de transferDetectionService
 * @see {@link src/services/transfers/transferDetectionService.ts}
 */
export const detectPotentialTransfers = async (
  employeeId: string
): Promise<
  Array<{ from_company_id: string; to_company_id: string; detected_date: string }>
> => {
  // Migrado a src/services/transfers/transferDetectionService.ts
  // para mejor separación de concerns
  return [];
};
