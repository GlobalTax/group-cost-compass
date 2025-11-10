import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';
import { supabase } from '@/integrations/supabase/client';

async function sendMetricToSupabase(metric: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("org_id")
      .eq("user_id", user?.id || "")
      .single();

    await supabase.from("performance_metrics").insert({
      user_id: user?.id,
      route: window.location.pathname,
      user_agent: navigator.userAgent,
      metric_name: metric.name,
      metric_value: metric.value,
      metric_rating: metric.rating,
      org_id: userRole?.org_id,
    });
  } catch (error) {
    console.error("[WebVitals] Error enviando métrica:", error);
  }
}

export const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  const handleMetric = (metric: any) => {
    onPerfEntry?.(metric);
    if (import.meta.env.PROD) {
      sendMetricToSupabase(metric);
    }
  };

  if (onPerfEntry || import.meta.env.PROD) {
    onCLS(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);
    onINP(handleMetric);
  }
};
