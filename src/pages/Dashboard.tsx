import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, TrendingUp, Euro } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { CostChart } from "@/components/dashboard/CostChart";
import { EmployeeTable } from "@/components/dashboard/EmployeeTable";
import { useDashboardStats, useMonthlyCosts } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const [selectedYear] = useState(new Date().getFullYear());
  const currentYear = new Date().getFullYear();
  
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats({ year: selectedYear });
  const { data: monthlyCosts, isLoading: isLoadingCosts } = useMonthlyCosts({ year: selectedYear });

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoadingStats ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <KPICard
                title="Empleados Activos"
                value={stats?.activeEmployees || 0}
                format="number"
                icon={Users}
                className="glass-elevated"
              />
              <KPICard
                title="Coste Total Anual"
                value={stats?.costeTotal || 0}
                format="currency"
                icon={Euro}
                trend={stats?.brutoChange}
                className="glass-elevated"
              />
              <KPICard
                title="Bruto Total Anual"
                value={stats?.brutoTotal || 0}
                format="currency"
                icon={TrendingUp}
                className="glass-elevated"
              />
              <KPICard
                title="Registros de Costes"
                value={stats?.costsCount || 0}
                format="number"
                icon={Building2}
                className="glass-elevated"
              />
            </>
          )}
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
              {isLoadingCosts ? (
                <Skeleton className="h-80" />
              ) : (
                <CostChart type="monthly" data={monthlyCosts || []} />
              )}
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
              {isLoadingCosts ? (
                <Skeleton className="h-80" />
              ) : (
                <CostChart type="yearly" data={[]} />
              )}
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
