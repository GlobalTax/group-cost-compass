import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CostsOverviewKPIs } from "@/components/costs/CostsOverviewKPIs";
import { CostsOverviewTable } from "@/components/costs/CostsOverviewTable";
import { useCostsOverview } from "@/hooks/useCostsOverview";
import { useCompanies } from "@/hooks/useCompanies";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator } from "lucide-react";

const CostsOverview = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");

  const { data: companies } = useCompanies();
  const { data: costsData, isLoading } = useCostsOverview({
    year: selectedYear,
    companyId: selectedCompanyId,
  });

  // Generar lista de años (actual - 3 años hacia atrás)
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Coste Total de Plantilla"
        subtitle="Desglose completo de costes: salarios, seguridad social y bonus"
      />

      {/* Filtros */}
      <div className="flex gap-4">
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => setSelectedYear(parseInt(value))}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
          <SelectTrigger className="w-64">
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

      {/* KPIs */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        costsData && <CostsOverviewKPIs data={costsData} />
      )}

      {/* Tabla detallada */}
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        costsData && (
          <CostsOverviewTable data={costsData} year={selectedYear} />
        )
      )}
    </div>
  );
};

export default CostsOverview;
