import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPICard } from "@/components/dashboard/KPICard";
import { CostsChart } from "@/components/costs/CostsChart";
import { CostsDetailTable } from "@/components/costs/CostsDetailTable";
import { CostsByTeamTable } from "@/components/costs/CostsByTeamTable";
import { EmptyState } from "@/components/costs/EmptyState";
import { ManualPayrollTable } from "@/components/costs/ManualPayrollTable";
import { Card } from "@/components/ui/card";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCompanies } from "@/hooks/useCompanies";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeams } from "@/hooks/useTeams";
import { useCostsAnalysis } from "@/hooks/useCostsAnalysis";
import { useDeleteCostsByPeriod } from "@/hooks/useEmployeeCosts";
import { exportCostsToCSV } from "@/lib/exporters/costsExporter";
import { toast } from "sonner";

const Costs = () => {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [companyId, setCompanyId] = useState<string>("all");
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: companies } = useCompanies();
  const { data: departments } = useDepartments();
  const { data: teams } = useTeams({ 
    departmentId: selectedDepartmentIds.length === 1 ? selectedDepartmentIds[0] : undefined 
  });
  
  const analysis = useCostsAnalysis({ 
    year, 
    month, 
    companyId,
    teamIds: selectedTeamIds.length > 0 ? selectedTeamIds : undefined
  });
  const deleteMutation = useDeleteCostsByPeriod();

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);
  const months = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ];

  const handleExport = () => {
    if (analysis.employeeDetails.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    exportCostsToCSV(analysis.employeeDetails, { company: companyId, year, month });
    toast.success("Datos exportados correctamente");
  };

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({
      year,
      month,
      companyId: companyId === "all" ? undefined : companyId,
    });
    setShowDeleteDialog(false);
  };

  return (
    <div id="main-content" className="p-8 space-y-8">
      <PageHeader
        title="Costes Mensuales"
        subtitle="Análisis detallado de costes por empresa y periodo"
        showCompany={false}
      />

      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5 w-full md:w-[250px]">
          <Label htmlFor="company-filter" className="text-sm font-medium">
            Empresa
          </Label>
          <Select value={companyId} onValueChange={setCompanyId}>
            <SelectTrigger id="company-filter">
              <SelectValue placeholder="Todas las empresas" />
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

        <div className="flex flex-col gap-1.5 w-full md:w-[250px]">
          <Label className="text-sm font-medium">Departamentos</Label>
          <MultiSelectFilter
            label="Departamentos"
            options={departments?.map(d => ({ id: d.id, name: d.name })) || []}
            selectedIds={selectedDepartmentIds}
            onChange={setSelectedDepartmentIds}
            placeholder="Todos los departamentos"
          />
        </div>

        <div className="flex flex-col gap-1.5 w-full md:w-[250px]">
          <Label className="text-sm font-medium">Equipos</Label>
          <MultiSelectFilter
            label="Equipos"
            options={teams?.map(t => ({ id: t.id, name: t.name })) || []}
            selectedIds={selectedTeamIds}
            onChange={setSelectedTeamIds}
            placeholder="Todos los equipos"
            emptyMessage={selectedDepartmentIds.length === 0 ? "Selecciona primero un departamento" : "No hay equipos"}
          />
        </div>

        <div className="flex flex-col gap-1.5 w-full md:w-[150px]">
          <Label htmlFor="year-filter" className="text-sm font-medium">
            Año
          </Label>
          <Select value={year.toString()} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger id="year-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 w-full md:w-[180px]">
          <Label htmlFor="month-filter" className="text-sm font-medium">
            Mes
          </Label>
          <Select value={month.toString()} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger id="month-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="w-full md:w-auto md:mt-6">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          
          <Button 
            onClick={() => setShowDeleteDialog(true)} 
            variant="destructive" 
            className="w-full md:w-auto md:mt-6"
            disabled={analysis.employeeDetails.length === 0 || deleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar mes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analysis">Detalle</TabsTrigger>
          <TabsTrigger value="teams">Por Equipo</TabsTrigger>
          <TabsTrigger value="manual">Entrada manual</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Coste Total"
              value={analysis.totalCost}
              format="currency"
            />
            <KPICard
              title="Empleados Activos"
              value={analysis.activeEmployees}
              format="number"
            />
            <KPICard
              title="Coste Medio/Empleado"
              value={analysis.avgCostPerEmployee}
              format="currency"
            />
            <KPICard
              title="Variación vs Mes Anterior"
              value={analysis.variationVsPreviousMonth}
              format="percentage"
            />
          </div>

          {/* Gráfico */}
          {analysis.hasData ? (
            <CostsChart data={analysis.chartData} />
          ) : (
            <Card className="p-6">
              <EmptyState message="Aún no hay costes para este mes" />
            </Card>
          )}

          {/* Tabla de detalle */}
          <CostsDetailTable
            employees={analysis.employeeDetails}
            isLoading={analysis.isLoading}
          />
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <CostsByTeamTable
            employees={analysis.employeeDetails}
            isLoading={analysis.isLoading}
          />
        </TabsContent>

        <TabsContent value="manual">
          <ManualPayrollTable 
            companyId={companyId} 
            year={year} 
            month={month} 
          />
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar datos del mes?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará todos los registros de nómina de{" "}
              <strong>
                {months.find(m => m.value === month)?.label} {year}
              </strong>
              {companyId !== "all" && companies && (
                <>
                  {" "}para <strong>{companies.find(c => c.id === companyId)?.name}</strong>
                </>
              )}
              .
              <br />
              <br />
              Esta operación <strong className="text-destructive">no se puede deshacer</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Costs;
