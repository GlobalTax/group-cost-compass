import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, TrendingUp, Euro } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { CostChart } from "@/components/dashboard/CostChart";
import { EmployeeTable } from "@/components/dashboard/EmployeeTable";

const Dashboard = () => {
  const currentYear = new Date().getFullYear();

  // Mock data - será reemplazado por datos reales de Supabase
  const kpis = {
    brutoTotal: 1234567.89,
    costeTotal: 1567890.12,
    numEmpleados: 43,
    subidaSalarial: 8.5,
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Bruto Total"
            value={kpis.brutoTotal}
            format="currency"
            icon={Euro}
            trend={5.2}
            className="glass-elevated"
          />
          <KPICard
            title="Coste Empresa"
            value={kpis.costeTotal}
            format="currency"
            icon={TrendingUp}
            trend={6.8}
            className="glass-elevated"
          />
          <KPICard
            title="Empleados Activos"
            value={kpis.numEmpleados}
            format="number"
            icon={Users}
            className="glass-elevated"
          />
          <KPICard
            title="Subida Salarial"
            value={kpis.subidaSalarial}
            format="percentage"
            icon={Building2}
            trend={2.3}
            className="glass-elevated"
          />
        </div>

        {/* Charts Section */}
        <Card className="glass-card p-6">
          <Tabs defaultValue="monthly" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="monthly">Evolución Mensual</TabsTrigger>
              <TabsTrigger value="yearly">Comparativa Anual</TabsTrigger>
            </TabsList>
            
            <TabsContent value="monthly" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Costes Mensuales {currentYear}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Evolución del bruto y coste empresa por mes
                </p>
              </div>
              <CostChart type="monthly" />
            </TabsContent>
            
            <TabsContent value="yearly" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Comparativa Anual
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Evolución interanual de costes totales
                </p>
              </div>
              <CostChart type="yearly" />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Employee Table */}
        <Card className="glass-card p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              Plantilla Actual
            </h3>
            <p className="text-sm text-muted-foreground">
              Detalle de empleados activos y sus costes
            </p>
          </div>
          <EmployeeTable />
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
