import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useErrorLogs } from "@/hooks/useErrorLogs";
import { AlertTriangle, XCircle, AlertCircle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const SEVERITY_CONFIG = {
  critical: { icon: XCircle, color: "text-red-500", bgColor: "bg-red-50 dark:bg-red-950/20", label: "Crítico" },
  error: { icon: AlertTriangle, color: "text-orange-500", bgColor: "bg-orange-50 dark:bg-orange-950/20", label: "Error" },
  warning: { icon: AlertCircle, color: "text-yellow-500", bgColor: "bg-yellow-50 dark:bg-yellow-950/20", label: "Warning" },
  info: { icon: Info, color: "text-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950/20", label: "Info" },
};

export const ErrorLogsPanel = () => {
  const { data: errorLogs, isLoading } = useErrorLogs({
    hours: 24,
    severities: ["critical", "error"],
  });

  if (isLoading) {
    return <div className="text-muted-foreground">Cargando errores...</div>;
  }

  const criticalCount = errorLogs?.summary?.criticalCount || 0;
  const errorCount = errorLogs?.summary?.errorCount || 0;
  const totalErrors = criticalCount + errorCount;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Errores Críticos (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {criticalCount}
            </div>
            {criticalCount > 0 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">⚠️ Requiere atención inmediata</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Errores Totales (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">
              {totalErrors}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ruta Más Afectada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-mono">
              {errorLogs?.summary?.mostAffectedRoute || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {errorLogs?.summary?.mostAffectedRouteCount || 0} errores
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Errores Recientes (últimos 50)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {errorLogs?.logs?.map((log: any) => {
              const config = SEVERITY_CONFIG[log.new_data?.severity || "error"];
              const Icon = config.icon;

              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-lg border ${config.bgColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className={`h-5 w-5 ${config.color} mt-0.5`} />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-mono">
                            {log.new_data?.route || "Unknown route"}
                          </span>
                        </div>
                        <p className="text-sm font-medium">
                          {log.new_data?.message || "Sin mensaje"}
                        </p>
                        {log.new_data?.code && (
                          <p className="text-xs text-muted-foreground font-mono">
                            Código: {log.new_data.code}
                          </p>
                        )}
                        {log.new_data?.componentStack && (
                          <details className="text-xs mt-2">
                            <summary className="cursor-pointer text-muted-foreground">
                              Ver stack trace
                            </summary>
                            <pre className="mt-2 p-2 bg-black/5 dark:bg-white/5 rounded overflow-x-auto">
                              {log.new_data.componentStack}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                </div>
              );
            })}

            {(!errorLogs?.logs || errorLogs.logs.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                ✅ No hay errores en las últimas 24 horas
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
