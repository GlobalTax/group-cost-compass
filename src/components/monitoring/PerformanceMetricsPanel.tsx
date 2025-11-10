import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePerformanceMetrics } from "@/hooks/usePerformanceMetrics";
import { Activity, TrendingUp, Zap, Clock } from "lucide-react";
import { formatDuration } from "@/lib/formatters";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export const PerformanceMetricsPanel = () => {
  const { data: metrics, isLoading } = usePerformanceMetrics({
    hours: 24,
  });

  if (isLoading) {
    return <div className="text-muted-foreground">Cargando métricas...</div>;
  }

  const avgMetrics = metrics?.summary || {
    avgFCP: 0,
    avgLCP: 0,
    avgTTFB: 0,
    avgINP: 0,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">FCP (First Contentful Paint)</CardTitle>
              <Zap className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(avgMetrics.avgFCP)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {avgMetrics.avgFCP < 1500 ? "✅ Bueno" : avgMetrics.avgFCP < 2500 ? "⚠️ Mejorable" : "❌ Pobre"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">LCP (Largest Contentful Paint)</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(avgMetrics.avgLCP)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {avgMetrics.avgLCP < 2500 ? "✅ Bueno" : avgMetrics.avgLCP < 4000 ? "⚠️ Mejorable" : "❌ Pobre"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">TTFB (Time to First Byte)</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(avgMetrics.avgTTFB)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {avgMetrics.avgTTFB < 800 ? "✅ Bueno" : avgMetrics.avgTTFB < 1800 ? "⚠️ Mejorable" : "❌ Pobre"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">INP (Interaction to Next Paint)</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(avgMetrics.avgINP)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {avgMetrics.avgINP < 200 ? "✅ Bueno" : avgMetrics.avgINP < 500 ? "⚠️ Mejorable" : "❌ Pobre"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Rendimiento (últimas 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics?.timeSeries || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                tickFormatter={(value) => `${value}:00`}
              />
              <YAxis label={{ value: "ms", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgFCP"
                stroke="#3b82f6"
                name="FCP"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="avgLCP"
                stroke="#10b981"
                name="LCP"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="avgTTFB"
                stroke="#f97316"
                name="TTFB"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rutas Más Lentas (Top 5)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics?.slowestRoutes?.map((route) => (
              <div
                key={route.route}
                className="flex justify-between items-center p-3 border rounded-lg"
              >
                <span className="font-mono text-sm">{route.route}</span>
                <div className="flex gap-4 text-sm">
                  <span>FCP: {formatDuration(route.avgFCP)}</span>
                  <span>LCP: {formatDuration(route.avgLCP)}</span>
                  <span className="text-muted-foreground">
                    {route.count} visitas
                  </span>
                </div>
              </div>
            ))}
            {(!metrics?.slowestRoutes || metrics.slowestRoutes.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No hay datos suficientes para mostrar
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
