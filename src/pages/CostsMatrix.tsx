import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MonthlyCostsMatrix } from "@/components/costs/MonthlyCostsMatrix";
import { MonthlyHeadcountMatrix } from "@/components/costs/MonthlyHeadcountMatrix";
import { KPICard } from "@/components/dashboard/KPICard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMonthlyMatrix } from "@/hooks/useMonthlyMatrix";
import { useMonthlyHeadcount } from "@/hooks/useMonthlyHeadcount";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const CostsMatrix = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [companyId, setCompanyId] = useState<string>("all");
  const [costType, setCostType] = useState<"bruto" | "total">("total");
  const [includeLeave, setIncludeLeave] = useState(false);
  const [activeTab, setActiveTab] = useState<"costs" | "headcount">("costs");

  const { data: companies } = useCompanies();
  const { data: matrixData, isLoading: isLoadingCosts } = useMonthlyMatrix({
    year,
    companyId,
    costType,
  });

  const { data: headcountData, isLoading: isLoadingHeadcount } = useMonthlyHeadcount({
    year,
    companyId: companyId === "all" ? undefined : companyId,
    includeLeave,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Calcular KPIs de Costes
  const costsKpis = matrixData
    ? {
        totalAnual: matrixData.grandTotal,
        employeeCount: matrixData.rows.length,
        avgMonthly: matrixData.grandTotal / 12,
        maxMonth: Math.max(...Object.values(matrixData.monthlyTotals)),
      }
    : { totalAnual: 0, employeeCount: 0, avgMonthly: 0, maxMonth: 0 };

  // Calcular KPIs de Headcount
  const headcountKpis = headcountData
    ? {
        current: headcountData.monthlyTotals[headcountData.monthsOfYear[11]] || 0,
        avgAnual: headcountData.grandTotal,
        netGrowth:
          (headcountData.monthlyTotals[headcountData.monthsOfYear[11]] || 0) -
          (headcountData.monthlyTotals[headcountData.monthsOfYear[0]] || 0),
        maxMonth: Math.max(...Object.values(headcountData.monthlyTotals)),
      }
    : { current: 0, avgAnual: 0, netGrowth: 0, maxMonth: 0 };

  const handleExportCosts = () => {
    if (!matrixData) {
      toast.error("No hay datos para exportar");
      return;
    }

    const wsData = [
      [
        "Empleado",
        "Empresa",
        ...matrixData.monthsOfYear.map((m) => {
          const month = m.split("-")[1];
          const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
          return monthNames[parseInt(month) - 1];
        }),
        "TOTAL",
      ],
      ...matrixData.rows.map((row) => [
        row.full_name,
        row.company,
        ...matrixData.monthsOfYear.map((m) => row.months[m] || 0),
        row.total,
      ]),
      [
        "TOTAL",
        "",
        ...matrixData.monthsOfYear.map((m) => matrixData.monthlyTotals[m]),
        matrixData.grandTotal,
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Costes ${year}`);
    XLSX.writeFile(wb, `matriz_costes_${year}.xlsx`);
    toast.success("Exportado correctamente");
  };

  const handleExportHeadcount = () => {
    if (!headcountData) {
      toast.error("No hay datos para exportar");
      return;
    }

    const wsData = [
      [
        "Empresa",
        ...headcountData.monthsOfYear.map((m) => {
          const month = m.split("-")[1];
          const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
          return monthNames[parseInt(month) - 1];
        }),
        "PROMEDIO",
        "MAX",
        "MIN",
      ],
      ...headcountData.rows.map((row) => [
        row.company_name,
        ...headcountData.monthsOfYear.map((m) => row.months[m] || 0),
        row.total,
        row.maxMonth,
        row.minMonth,
      ]),
      [
        "TOTAL",
        ...headcountData.monthsOfYear.map((m) => headcountData.monthlyTotals[m]),
        headcountData.grandTotal,
        Math.max(...Object.values(headcountData.monthlyTotals)),
        Math.min(...Object.values(headcountData.monthlyTotals)),
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Plantilla ${year}`);
    XLSX.writeFile(wb, `matriz_plantilla_${year}.xlsx`);
    toast.success("Exportado correctamente");
  };

  return (
    <div className="p-8 space-y-8">
      <PageHeader
        title="Análisis Mensual"
        subtitle="Vista consolidada de costes y plantilla por mes"
        showCompany={false}
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="costs">💰 Costes Mensuales</TabsTrigger>
          <TabsTrigger value="headcount">👥 Plantilla Mensual</TabsTrigger>
        </TabsList>

        <TabsContent value="costs" className="space-y-8 mt-6">
          {/* Filtros Costes */}
          <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1.5 w-[250px]">
          <Label>Empresa</Label>
          <Select value={companyId} onValueChange={setCompanyId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las empresas</SelectItem>
              {companies?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5 w-[150px]">
          <Label>Año</Label>
          <Select value={year.toString()} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger>
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

            <div className="flex flex-col gap-1.5 w-[200px]">
              <Label>Tipo de coste</Label>
              <Select value={costType} onValueChange={(v) => setCostType(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="total">Coste Total Empresa</SelectItem>
                  <SelectItem value="bruto">Bruto Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* KPIs Costes */}
          {isLoadingCosts ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KPICard title="Coste Anual Total" value={costsKpis.totalAnual} format="currency" />
              <KPICard title="Empleados" value={costsKpis.employeeCount} format="number" />
              <KPICard title="Promedio Mensual" value={costsKpis.avgMonthly} format="currency" />
              <KPICard title="Máximo Mes" value={costsKpis.maxMonth} format="currency" />
            </div>
          )}

          {/* Matriz Costes */}
          {isLoadingCosts ? (
            <Skeleton className="h-[600px]" />
          ) : matrixData ? (
            <MonthlyCostsMatrix
              rows={matrixData.rows}
              monthsOfYear={matrixData.monthsOfYear}
              monthlyTotals={matrixData.monthlyTotals}
              grandTotal={matrixData.grandTotal}
              onExport={handleExportCosts}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="headcount" className="space-y-8 mt-6">
          {/* Filtros Headcount */}
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1.5 w-[250px]">
              <Label>Empresa</Label>
              <Select value={companyId} onValueChange={setCompanyId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las empresas</SelectItem>
                  {companies?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 w-[150px]">
              <Label>Año</Label>
              <Select value={year.toString()} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger>
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
          </div>

          {/* KPIs Headcount */}
          {isLoadingHeadcount ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <KPICard title="Plantilla Actual" value={headcountKpis.current} format="number" />
              <KPICard title="Promedio Anual" value={headcountKpis.avgAnual} format="number" />
              <KPICard title="Crecimiento Neto" value={headcountKpis.netGrowth} format="number" />
              <KPICard title="Máximo Mes" value={headcountKpis.maxMonth} format="number" />
            </div>
          )}

          {/* Matriz Headcount */}
          {isLoadingHeadcount ? (
            <Skeleton className="h-[600px]" />
          ) : headcountData ? (
            <MonthlyHeadcountMatrix
              rows={headcountData.rows}
              monthsOfYear={headcountData.monthsOfYear}
              monthlyTotals={headcountData.monthlyTotals}
              grandTotal={headcountData.grandTotal}
              onExport={handleExportHeadcount}
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CostsMatrix;
