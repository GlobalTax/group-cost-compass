import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";
import { useRevenues, useRevenueAnalytics } from "@/hooks/useRevenues";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { RevenueKPIs } from "@/components/revenues/RevenueKPIs";
import { RevenuesTable } from "@/components/revenues/RevenuesTable";
import { CreateRevenueDialog } from "@/components/revenues/CreateRevenueDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanies } from "@/hooks/useCompanies";

const Revenues = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

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

  // Calcular KPIs
  const kpis = useMemo(() => {
    if (!analyticsData) {
      return {
        totalRevenue: 0,
        recurringRevenue: 0,
        oneTimeRevenue: 0,
        topContributors: 0,
      };
    }

    const totalRevenue = analyticsData.reduce(
      (sum, item) => sum + Number(item.total_amount),
      0
    );

    const recurringRevenue = analyticsData
      .filter((item) => item.is_recurring)
      .reduce((sum, item) => sum + Number(item.total_amount), 0);

    const oneTimeRevenue = totalRevenue - recurringRevenue;

    // Contar contribuyentes únicos (simplificado)
    const uniqueContributors = new Set(
      revenues?.flatMap((r) => 
        r.revenue_allocations?.map((a: any) => 
          a.employee_id || a.team_id
        ) || []
      )
    );

    return {
      totalRevenue,
      recurringRevenue,
      oneTimeRevenue,
      topContributors: uniqueContributors.size,
    };
  }, [analyticsData, revenues]);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este ingreso?")) {
      await deleteRevenue.mutateAsync(id);
    }
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
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Importar CSV
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

      {/* Diálogos */}
      <CreateRevenueDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
};

export default Revenues;
