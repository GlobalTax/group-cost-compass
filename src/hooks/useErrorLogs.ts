import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subHours } from "date-fns";

interface ErrorLogsOptions {
  hours?: number;
  severities?: string[];
}

export const useErrorLogs = (options: ErrorLogsOptions = {}) => {
  const { hours = 24, severities = ["critical", "error"] } = options;

  return useQuery({
    queryKey: ["error-logs", hours, severities],
    queryFn: async () => {
      const startDate = subHours(new Date(), hours);

      const { data: logs, error } = await supabase
        .from("audit_logs")
        .select("*")
        .in("action", ["ERROR", "CRITICAL_ERROR"])
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      const criticalCount = logs?.filter(
        (l) => (l.new_data as any)?.severity === "critical"
      ).length || 0;

      const errorCount = logs?.filter(
        (l) => (l.new_data as any)?.severity === "error"
      ).length || 0;

      const routeCounts = logs?.reduce((acc, l) => {
        const route = (l.new_data as any)?.route || "unknown";
        acc[route] = (acc[route] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostAffectedRoute = Object.entries(routeCounts || {}).sort(
        ([, a], [, b]) => b - a
      )[0];

      return {
        logs,
        summary: {
          criticalCount,
          errorCount,
          mostAffectedRoute: mostAffectedRoute?.[0],
          mostAffectedRouteCount: mostAffectedRoute?.[1],
        },
      };
    },
    staleTime: 30000,
  });
};
