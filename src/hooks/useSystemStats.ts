import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";

interface SystemStatsOptions {
  days?: number;
}

export const useSystemStats = (options: SystemStatsOptions = {}) => {
  const { days = 30 } = options;

  return useQuery({
    queryKey: ["system-stats", days],
    queryFn: async () => {
      const startDate = subDays(new Date(), days);

      const { data: actions, error: actionsError } = await supabase
        .from("audit_logs")
        .select("action, table_name, user_id")
        .gte("created_at", startDate.toISOString());

      if (actionsError) throw actionsError;

      const activeUsers = new Set(actions?.map((a) => a.user_id).filter(Boolean)).size;
      const totalActions = actions?.length || 0;

      const actionsByType = actions?.reduce((acc, a) => {
        const existing = acc.find((x: any) => x.action === a.action);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ action: a.action, count: 1 });
        }
        return acc;
      }, [] as any[]);

      const actionsByTable = actions?.reduce((acc, a) => {
        const existing = acc.find((x: any) => x.name === a.table_name);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ name: a.table_name, count: 1 });
        }
        return acc;
      }, [] as any[]);

      const userCounts = actions?.reduce((acc, a) => {
        if (a.user_id) {
          acc[a.user_id] = (acc[a.user_id] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const topUsers = Object.entries(userCounts || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([user_id, action_count]) => ({ user_id, action_count }));

      const { count: employeesCount } = await supabase
        .from("hr_employees")
        .select("*", { count: "exact", head: true });

      const { count: costsCount } = await supabase
        .from("hr_employee_costs")
        .select("*", { count: "exact", head: true });

      const totalRecords = (employeesCount || 0) + (costsCount || 0);

      return {
        activeUsers,
        totalActions,
        totalRecords,
        growthPercent: 5,
        actionsByType,
        actionsByTable,
        topUsers,
      };
    },
    staleTime: 300000,
  });
};
