import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useImportLogs } from "@/hooks/useImportLogs";
import { FileUp, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { formatDuration } from "@/lib/formatters";

const STATUS_CONFIG = {
  completed: { icon: CheckCircle, color: "text-green-500", variant: "default", label: "Completado" },
  failed: { icon: XCircle, color: "text-red-500", variant: "destructive", label: "Fallido" },
  processing: { icon: Clock, color: "text-blue-500", variant: "secondary", label: "Procesando" },
  pending: { icon: Clock, color: "text-gray-500", variant: "outline", label: "Pendiente" },
};

export const ImportLogsPanel = () => {
  const { data: importLogs, isLoading } = useImportLogs({
    days: 30,
  });

  if (isLoading) {
    return <div className="text-muted-foreground">Cargando historial...</div>;
  }

  const stats = importLogs?.summary || {
    totalImports: 0,
    successfulImports: 0,
    failedImports: 0,
    avgDuration: 0,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Importaciones (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalImports}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Exitosas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {stats.successfulImports}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalImports > 0
                ? `${((stats.successfulImports / stats.totalImports) * 100).toFixed(1)}% tasa éxito`
                : "N/A"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Fallidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {stats.failedImports}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Duración Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatDuration(stats.avgDuration)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Importaciones A3Nom</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {importLogs?.logs?.map((log: any) => {
              const config = STATUS_CONFIG[log.status || "pending"];
              const Icon = config.icon;

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <FileUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={config.variant as any}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          <span className="text-sm font-medium">
                            {log.import_type?.toUpperCase()} - {log.period || "N/A"}
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total:</span>{" "}
                            <span className="font-medium">{log.total_records}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Exitosos:</span>{" "}
                            <span className="font-medium text-green-600">
                              {log.successful_records}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Fallidos:</span>{" "}
                            <span className="font-medium text-red-600">
                              {log.failed_records}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Duración:</span>{" "}
                            <span className="font-medium">
                              {log.duration_ms ? formatDuration(log.duration_ms) : "N/A"}
                            </span>
                          </div>
                        </div>

                        {log.employees_created > 0 && (
                          <p className="text-xs text-muted-foreground">
                            ✨ {log.employees_created} empleados nuevos creados
                          </p>
                        )}

                        {log.errors && log.errors.length > 0 && (
                          <details className="text-xs mt-2">
                            <summary className="cursor-pointer text-red-600 dark:text-red-400">
                              Ver {log.errors.length} errores
                            </summary>
                            <ul className="mt-2 space-y-1 list-disc list-inside">
                              {log.errors.map((err: string, idx: number) => (
                                <li key={idx}>{err}</li>
                              ))}
                            </ul>
                          </details>
                        )}

                        {log.warnings && log.warnings.length > 0 && (
                          <details className="text-xs mt-2">
                            <summary className="cursor-pointer text-yellow-600 dark:text-yellow-400">
                              Ver {log.warnings.length} warnings
                            </summary>
                            <ul className="mt-2 space-y-1 list-disc list-inside">
                              {log.warnings.map((warn: string, idx: number) => (
                                <li key={idx}>{warn}</li>
                              ))}
                            </ul>
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

            {(!importLogs?.logs || importLogs.logs.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                No hay importaciones registradas en los últimos 30 días
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
