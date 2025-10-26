import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AuditLogFilters {
  userId?: string;
  tableName?: string;
  startDate?: Date;
  endDate?: Date;
}

export const useAuditLogs = (filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.userId) {
        query = query.eq("user_id", filters.userId);
      }

      if (filters?.tableName) {
        query = query.eq("table_name", filters.tableName);
      }

      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};

export const useAuditLog = (id: string) => {
  return useQuery({
    queryKey: ["audit-log", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};
