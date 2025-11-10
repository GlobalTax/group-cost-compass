import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";

interface ImportLogsOptions {
  days?: number;
}

export const useImportLogs = (options: ImportLogsOptions = {}) => {
  const { days = 30 } = options;

  return useQuery({
    queryKey: ["import-logs", days],
    queryFn: async () => {
      const startDate = subDays(new Date(), days);

      const { data: logs, error } = await supabase
        .from("import_logs")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const totalImports = logs?.length || 0;
      const successfulImports = logs?.filter((l) => l.status === "completed").length || 0;
      const failedImports = logs?.filter((l) => l.status === "failed").length || 0;

      const avgDuration =
        logs?.reduce((sum, l) => sum + (l.duration_ms || 0), 0) / (totalImports || 1);

      return {
        logs,
        summary: {
          totalImports,
          successfulImports,
          failedImports,
          avgDuration,
        },
      };
    },
    staleTime: 60000,
  });
};
