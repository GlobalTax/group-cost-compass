import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { MonthlyCostsMatrix } from "@/components/costs/MonthlyCostsMatrix";
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
import { useMonthlyMatrix } from "@/hooks/useMonthlyMatrix";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const CostsMatrix = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [companyId, setCompanyId] = useState<string>("all");
  const [costType, setCostType] = useState<"bruto" | "total">("total");

  const { data: companies } = useCompanies();
  const { data: matrixData, isLoading } = useMonthlyMatrix({
    year,
    companyId,
    costType,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Calcular KPIs
  const kpis = matrixData
    ? {
        totalAnual: matrixData.grandTotal,
        employeeCount: matrixData.rows.length,
        avgMonthly: matrixData.grandTotal / 12,
        maxMonth: Math.max(...Object.values(matrixData.monthlyTotals)),
      }
    : { totalAnual: 0, employeeCount: 0, avgMonthly: 0, maxMonth: 0 };

  const handleExport = () => {
    if (!matrixData) {
      toast.error("No hay datos para exportar");
      return;
    }

    // Preparar datos para Excel
    const wsData = [
      // Headers
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
      // Rows
      ...matrixData.rows.map((row) => [
        row.full_name,
        row.company,
        ...matrixData.monthsOfYear.map((m) => row.months[m] || 0),
        row.total,
      ]),
      // Totals row
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

  return (
    <div className="p-8 space-y-8">
      <PageHeader
        title="Matriz de Costes Mensuales"
        subtitle="Vista consolidada de costes por empleado y mes"
        showCompany={false}
      />

      {/* Filtros */}
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

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard title="Coste Anual Total" value={kpis.totalAnual} format="currency" />
          <KPICard title="Empleados" value={kpis.employeeCount} format="number" />
          <KPICard title="Promedio Mensual" value={kpis.avgMonthly} format="currency" />
          <KPICard title="Máximo Mes" value={kpis.maxMonth} format="currency" />
        </div>
      )}

      {/* Matriz */}
      {isLoading ? (
        <Skeleton className="h-[600px]" />
      ) : matrixData ? (
        <MonthlyCostsMatrix
          rows={matrixData.rows}
          monthsOfYear={matrixData.monthsOfYear}
          monthlyTotals={matrixData.monthlyTotals}
          grandTotal={matrixData.grandTotal}
          onExport={handleExport}
        />
      ) : null}
    </div>
  );
};

export default CostsMatrix;
