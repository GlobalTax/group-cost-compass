import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subHours, format } from "date-fns";

interface PerformanceMetricsOptions {
  hours?: number;
}

export const usePerformanceMetrics = (options: PerformanceMetricsOptions = {}) => {
  const { hours = 24 } = options;

  return useQuery({
    queryKey: ["performance-metrics", hours],
    queryFn: async () => {
      const startDate = subHours(new Date(), hours);

      const { data: metrics, error } = await supabase
        .from("performance_metrics")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const metricsByType = metrics?.reduce((acc, m) => {
        if (!acc[m.metric_name]) acc[m.metric_name] = [];
        acc[m.metric_name].push(m.metric_value);
        return acc;
      }, {} as Record<string, number[]>);

      const summary = {
        avgFCP: calculateAvg(metricsByType?.FCP || []),
        avgLCP: calculateAvg(metricsByType?.LCP || []),
        avgTTFB: calculateAvg(metricsByType?.TTFB || []),
        avgINP: calculateAvg(metricsByType?.INP || []),
        avgCLS: calculateAvg(metricsByType?.CLS || []),
      };

      const timeSeries = metrics?.reduce((acc, m) => {
        const hour = format(new Date(m.created_at), "HH");
        if (!acc[hour]) {
          acc[hour] = { hour: parseInt(hour), FCP: [], LCP: [], TTFB: [], INP: [] };
        }
        if (m.metric_name === "FCP") acc[hour].FCP.push(m.metric_value);
        if (m.metric_name === "LCP") acc[hour].LCP.push(m.metric_value);
        if (m.metric_name === "TTFB") acc[hour].TTFB.push(m.metric_value);
        if (m.metric_name === "INP") acc[hour].INP.push(m.metric_value);
        return acc;
      }, {} as Record<string, any>);

      const timeSeriesArray = Object.values(timeSeries || {}).map((hour: any) => ({
        hour: hour.hour,
        avgFCP: calculateAvg(hour.FCP),
        avgLCP: calculateAvg(hour.LCP),
        avgTTFB: calculateAvg(hour.TTFB),
        avgINP: calculateAvg(hour.INP),
      }));

      const routeMetrics = metrics?.reduce((acc, m) => {
        if (!acc[m.route]) {
          acc[m.route] = { route: m.route, FCP: [], LCP: [], count: 0 };
        }
        if (m.metric_name === "FCP") acc[m.route].FCP.push(m.metric_value);
        if (m.metric_name === "LCP") acc[m.route].LCP.push(m.metric_value);
        acc[m.route].count++;
        return acc;
      }, {} as Record<string, any>);

      const slowestRoutes = Object.values(routeMetrics || {})
        .map((route: any) => ({
          route: route.route,
          avgFCP: calculateAvg(route.FCP),
          avgLCP: calculateAvg(route.LCP),
          count: route.count,
        }))
        .sort((a, b) => b.avgLCP - a.avgLCP)
        .slice(0, 5);

      return {
        summary,
        timeSeries: timeSeriesArray,
        slowestRoutes,
      };
    },
    staleTime: 60000,
  });
};

function calculateAvg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
