import { Card } from "@/components/ui/card";
import { Users, TrendingUp, Euro, FileText } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { EmployeeTable } from "@/components/dashboard/EmployeeTable";
import { CostChart } from "@/components/dashboard/CostChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats, useMonthlyCosts } from "@/hooks/useDashboardStats";

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats({ year: new Date().getFullYear() });
  const { data: monthlyCosts } = useMonthlyCosts({ year: new Date().getFullYear() });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visión general del control de costes del grupo
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
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
              className="apollo-card apollo-card-hover"
            />
            <KPICard
              title="Coste Anual Total"
              value={stats?.costeTotal || 0}
              format="currency"
              icon={Euro}
              className="apollo-card apollo-card-hover"
            />
            <KPICard
              title="Bruto Anual Total"
              value={stats?.brutoTotal || 0}
              format="currency"
              icon={TrendingUp}
              className="apollo-card apollo-card-hover"
            />
            <KPICard
              title="Registros de Coste"
              value={stats?.costsCount || 0}
              format="number"
              icon={FileText}
              className="apollo-card apollo-card-hover"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <Card className="apollo-card p-6">
        <Tabs defaultValue="monthly" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Evolución de Costes</h2>
            <TabsList>
              <TabsTrigger value="monthly">Mensual</TabsTrigger>
              <TabsTrigger value="yearly">Anual</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="monthly" className="mt-0">
            <CostChart type="monthly" data={monthlyCosts || []} />
          </TabsContent>

          <TabsContent value="yearly" className="mt-0">
            <CostChart type="yearly" data={[]} />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Employee Table */}
      <Card className="apollo-card p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Empleados Activos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Listado completo de la plantilla actual
          </p>
        </div>
        <EmployeeTable filters={{ activeOnly: true }} />
      </Card>
    </div>
  );
};

export default Dashboard;
