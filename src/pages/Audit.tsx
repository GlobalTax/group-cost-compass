import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { AuditFilters } from "@/components/audit/AuditFilters";
import { AuditTable } from "@/components/audit/AuditTable";
import { AuditDrawer } from "@/components/audit/AuditDrawer";
import { exportAuditLogsToCSV } from "@/lib/exporters/auditExporter";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: any;
  new_data: any;
  created_at: string;
  user_id: string | null;
}

const Audit = () => {
  const [filters, setFilters] = useState<{
    userId?: string;
    tableName?: string;
    startDate?: Date;
    endDate?: Date;
  }>({});
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: logs = [], isLoading } = useAuditLogs(filters);

  const handleExport = () => {
    if (logs.length === 0) {
      toast.error("No hay registros para exportar");
      return;
    }
    exportAuditLogsToCSV(logs);
    toast.success("Registro de auditoría exportado");
  };

  const handleSelectLog = (log: AuditLog) => {
    setSelectedLog(log);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Registro de Auditoría"
        subtitle="Trazabilidad completa de cambios en el sistema"
      />

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Descargar CSV
          </Button>
        </div>

        <AuditFilters onFilterChange={setFilters} />

        {isLoading ? (
          <div className="glass-card p-12 text-center">
            <div className="animate-pulse text-muted-foreground">Cargando registros...</div>
          </div>
        ) : (
          <AuditTable logs={logs} onSelectLog={handleSelectLog} />
        )}
      </div>

      <AuditDrawer log={selectedLog} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
};

export default Audit;
