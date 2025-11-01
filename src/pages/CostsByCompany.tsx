import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompanyCostsComparisonTable } from "@/components/costs/CompanyCostsComparisonTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCompanies } from "@/hooks/useCompanies";

export default function CostsByCompany() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  const [selectedCompany, setSelectedCompany] = useState<string>("all");

  const { data: companies } = useCompanies();

  const availableYears = [currentYear, currentYear - 1, currentYear - 2];
  const months = [
    { value: undefined, label: "Acumulado Anual (YTD)" },
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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Costes por Empresa" 
        subtitle="Análisis comparativo de costes de personal por empresa con evolución interanual"
      />

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-lg border">
        <div className="space-y-2">
          <Label htmlFor="year-select">Año</Label>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value))}
          >
            <SelectTrigger id="year-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="month-select">Período</Label>
          <Select
            value={selectedMonth?.toString() || "ytd"}
            onValueChange={(value) =>
              setSelectedMonth(value === "ytd" ? undefined : parseInt(value))
            }
          >
            <SelectTrigger id="month-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem
                  key={month.value || "ytd"}
                  value={month.value?.toString() || "ytd"}
                >
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-select">Empresa</Label>
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger id="company-select">
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
      </div>

      {/* Tabla de comparativa */}
      <CompanyCostsComparisonTable
        year={selectedYear}
        month={selectedMonth}
        companyId={selectedCompany}
      />
    </div>
  );
}
