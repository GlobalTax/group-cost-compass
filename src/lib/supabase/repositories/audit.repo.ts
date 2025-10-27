/**
 * Repositorio para operaciones de auditoría
 */

import { supabase } from "../client";
import type { Database } from "@/integrations/supabase/types";

type AuditLog = Database["public"]["Tables"]["audit_logs"]["Row"];
type AuditLogInsert = Database["public"]["Tables"]["audit_logs"]["Insert"];

/**
 * Obtiene logs de auditoría con filtros y paginación
 */
export const fetchAuditLogs = async (filters?: {
  userId?: string;
  action?: string;
  tableName?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: AuditLog[]; count: number }> => {
  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters?.userId) {
    query = query.eq("user_id", filters.userId);
  }

  if (filters?.action) {
    query = query.eq("action", filters.action);
  }

  if (filters?.tableName) {
    query = query.eq("table_name", filters.tableName);
  }

  if (filters?.startDate) {
    query = query.gte("created_at", filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte("created_at", filters.endDate);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit || 50) - 1
    );
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return { data: data || [], count: count || 0 };
};

/**
 * Crea una entrada de auditoría
 */
export const createAuditLog = async (data: AuditLogInsert): Promise<AuditLog> => {
  const { data: log, error } = await supabase
    .from("audit_logs")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return log;
};

/**
 * Obtiene estadísticas de auditoría por período
 */
export const getAuditStats = async (startDate: string, endDate: string) => {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("action, table_name")
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (error) throw error;

  // Agrupar por acción
  const byAction = (data || []).reduce(
    (acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Agrupar por tabla
  const byTable = (data || []).reduce(
    (acc, log) => {
      acc[log.table_name] = (acc[log.table_name] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    total: data?.length || 0,
    byAction,
    byTable,
  };
};
