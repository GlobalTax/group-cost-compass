import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, FileSpreadsheet, BarChart3, Zap, RefreshCw } from "lucide-react";
import { useRevenues, useRevenueAnalytics } from "@/hooks/useRevenues";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { RevenueKPIs } from "@/components/revenues/RevenueKPIs";
import { RevenuesTable } from "@/components/revenues/RevenuesTable";
import { CreateRevenueDialog } from "@/components/revenues/CreateRevenueDialog";
import { RevenueCSVUpload } from "@/components/revenues/RevenueCSVUpload";
import { AllocationTemplatesManager } from "@/components/revenues/AllocationTemplatesManager";
import { QuickImportByCompany } from "@/components/revenues/QuickImportByCompany";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompanies } from "@/hooks/useCompanies";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const Revenues = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("list");

  const queryClient = useQueryClient();
  const { data: companies } = useCompanies();
  const { data: revenues, isLoading } = useRevenues({
    year: selectedYear,
    companyId: selectedCompany === "all" ? undefined : selectedCompany,
  });

  const { data: analyticsData } = useRevenueAnalytics({
    year: selectedYear,
    companyId: selectedCompany === "all" ? undefined : selectedCompany,
  });

  const { deleteRevenue } = useRevenueManagement();

  // Calcular KPIs con logging para debug
  const kpis = useMemo(() => {
    console.log('🔍 Debug KPIs - Revenues.tsx:', {
      analyticsDataLength: analyticsData?.length,
      revenuesLength: revenues?.length,
      selectedYear,
      selectedCompany,
      filters: {
        year: selectedYear,
        companyId: selectedCompany === "all" ? undefined : selectedCompany,
      }
    });

    // Usar analyticsData como fuente principal, revenues como fallback
    const dataSource = analyticsData && analyticsData.length > 0 ? analyticsData : revenues || [];
    
    if (dataSource.length === 0) {
      console.warn('⚠️ No hay datos disponibles para calcular KPIs');
      return {
        totalRevenue: 0,
        recurringRevenue: 0,
        oneTimeRevenue: 0,
        topContributors: 0,
      };
    }

    const totalRevenue = dataSource.reduce(
      (sum, item) => {
        const amount = Number(item.total_amount || 0);
        return sum + amount;
      },
      0
    );

    const recurringRevenue = dataSource
      .filter((item) => item.is_recurring)
      .reduce((sum, item) => {
        const amount = Number(item.total_amount || 0);
        return sum + amount;
      }, 0);

    const oneTimeRevenue = totalRevenue - recurringRevenue;

    // Contar contribuyentes únicos
    const uniqueContributors = new Set(
      revenues?.flatMap((r) => 
        r.revenue_allocations?.map((a: any) => 
          a.employee_id || a.team_id
        ) || []
      )
    );

    console.log('📊 KPIs calculados:', {
      totalRevenue,
      recurringRevenue,
      oneTimeRevenue,
      topContributors: uniqueContributors.size,
      dataSourceUsed: analyticsData && analyticsData.length > 0 ? 'analyticsData' : 'revenues',
      itemsProcessed: dataSource.length
    });

    return {
      totalRevenue,
      recurringRevenue,
      oneTimeRevenue,
      topContributors: uniqueContributors.size,
    };
  }, [analyticsData, revenues, selectedYear, selectedCompany]);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este ingreso?")) {
      await deleteRevenue.mutateAsync(id);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["revenues"] });
    queryClient.invalidateQueries({ queryKey: ["revenue-analytics"] });
    toast.success("Datos actualizados");
  };

  const years = Array.from(
    { length: 5 },
    (_, i) => currentYear - 2 + i
  );

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Gestión de Ingresos"
        subtitle="Registra y asigna ingresos mensuales por empresa y personas"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">
            <BarChart3 className="h-4 w-4 mr-2" />
            Ingresos
          </TabsTrigger>
          <TabsTrigger value="import">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Importar CSV
          </TabsTrigger>
          <TabsTrigger value="quick-import">
            <Zap className="h-4 w-4 mr-2" />
            Por Empresa
          </TabsTrigger>
          <TabsTrigger value="templates">
            <Zap className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Filtros */}
          <Card className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las empresas</SelectItem>
                    {companies?.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refrescar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Ingreso
                </Button>
              </div>
            </div>
          </Card>

          {/* KPIs */}
          <RevenueKPIs
            totalRevenue={kpis.totalRevenue}
            recurringRevenue={kpis.recurringRevenue}
            oneTimeRevenue={kpis.oneTimeRevenue}
            topContributors={kpis.topContributors}
          />

          {/* Tabla de ingresos */}
          <Card className="p-6">
            {isLoading ? (
              <div className="text-center py-12">Cargando...</div>
            ) : (
              <RevenuesTable
                revenues={revenues || []}
                onDelete={handleDelete}
              />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <RevenueCSVUpload
            onImportComplete={() => setActiveTab("list")}
          />
        </TabsContent>

        <TabsContent value="quick-import">
          <QuickImportByCompany
            onImportComplete={() => setActiveTab("list")}
          />
        </TabsContent>

        <TabsContent value="templates">
          <AllocationTemplatesManager />
        </TabsContent>
      </Tabs>

      {/* Diálogos */}
      <CreateRevenueDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default Revenues;
