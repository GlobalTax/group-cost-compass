import { Card } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/KPICard";
import { EmployeeTable } from "@/components/dashboard/EmployeeTable";
import { CostChart } from "@/components/dashboard/CostChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats, useMonthlyCosts } from "@/hooks/useDashboardStats";
import { PageHeader } from "@/components/layout/PageHeader";

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats({ year: new Date().getFullYear() });
  const { data: monthlyCosts } = useMonthlyCosts({ year: new Date().getFullYear() });

  return (
    <div className="p-8 space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Visión general del control de costes del grupo"
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <KPICard
              title="Empleados Activos"
              value={stats?.activeEmployees || 0}
              format="number"
            />
            <KPICard
              title="Coste Anual Total"
              value={stats?.costeTotal || 0}
              format="currency"
            />
            <KPICard
              title="Bruto Anual Total"
              value={stats?.brutoTotal || 0}
              format="currency"
            />
            <KPICard
              title="Registros de Coste"
              value={stats?.costsCount || 0}
              format="number"
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
      <div>
        <h2 className="text-lg font-semibold mb-4">Empleados Activos</h2>
        <Card className="p-6 border-gray-200">
          <EmployeeTable filters={{ activeOnly: true }} />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
