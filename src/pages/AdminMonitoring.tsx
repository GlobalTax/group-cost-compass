import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceMetricsPanel } from "@/components/monitoring/PerformanceMetricsPanel";
import { ErrorLogsPanel } from "@/components/monitoring/ErrorLogsPanel";
import { ImportLogsPanel } from "@/components/monitoring/ImportLogsPanel";
import { SystemStatsPanel } from "@/components/monitoring/SystemStatsPanel";
import { AlertConfigPanel } from "@/components/monitoring/AlertConfigPanel";

const AdminMonitoring = () => {
  const [activeTab, setActiveTab] = useState("performance");

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Monitoring Dashboard"
        subtitle="Panel interno de métricas, errores y rendimiento del sistema"
      />

      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="performance">Rendimiento</TabsTrigger>
            <TabsTrigger value="errors">Errores</TabsTrigger>
            <TabsTrigger value="imports">Importaciones</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceMetricsPanel />
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <ErrorLogsPanel />
          </TabsContent>

          <TabsContent value="imports" className="space-y-6">
            <ImportLogsPanel />
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <SystemStatsPanel />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertConfigPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminMonitoring;
