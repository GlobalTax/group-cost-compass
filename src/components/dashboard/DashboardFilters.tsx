import { memo, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompanies } from "@/hooks/useCompanies";
import { Calendar, Building2, CalendarDays } from "lucide-react";

interface DashboardFiltersProps {
  year: number;
  companyId: string;
  month: string;
  onYearChange: (year: number) => void;
  onCompanyChange: (companyId: string) => void;
  onMonthChange: (month: string) => void;
}

export const DashboardFilters = memo(({
  year,
  companyId,
  month,
  onYearChange,
  onCompanyChange,
  onMonthChange,
}: DashboardFiltersProps) => {
  const { data: companies } = useCompanies();

  // Memoize years array
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  // Memoize months array
  const months = useMemo(() => {
    return [
      { value: "all", label: "Todos los meses" },
      { value: `${year}-01`, label: "Enero" },
      { value: `${year}-02`, label: "Febrero" },
      { value: `${year}-03`, label: "Marzo" },
      { value: `${year}-04`, label: "Abril" },
      { value: `${year}-05`, label: "Mayo" },
      { value: `${year}-06`, label: "Junio" },
      { value: `${year}-07`, label: "Julio" },
      { value: `${year}-08`, label: "Agosto" },
      { value: `${year}-09`, label: "Septiembre" },
      { value: `${year}-10`, label: "Octubre" },
      { value: `${year}-11`, label: "Noviembre" },
      { value: `${year}-12`, label: "Diciembre" },
    ];
  }, [year]);

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <Select value={year.toString()} onValueChange={(v) => onYearChange(parseInt(v))}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Año" />
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

      <div className="flex items-center gap-2">
        <CalendarDays className="w-4 h-4 text-muted-foreground" />
        <Select value={month} onValueChange={onMonthChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Mes" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Building2 className="w-4 h-4 text-muted-foreground" />
        <Select value={companyId} onValueChange={onCompanyChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Empresa" />
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
  );
});

DashboardFilters.displayName = "DashboardFilters";
