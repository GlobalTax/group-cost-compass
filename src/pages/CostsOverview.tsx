import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CostsOverviewKPIs } from "@/components/costs/CostsOverviewKPIs";
import { CostsOverviewTable } from "@/components/costs/CostsOverviewTable";
import { useCostsOverview } from "@/hooks/useCostsOverview";
import { useEmployees } from "@/hooks/useEmployees";
import { useCompanies } from "@/hooks/useCompanies";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeams } from "@/hooks/useTeams";
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
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("all");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: companies } = useCompanies();
  const { data: departments } = useDepartments();
  const { data: teams } = useTeams({ 
    departmentId: selectedDepartmentId !== "all" ? selectedDepartmentId : undefined 
  });
  const { data: costsData, isLoading } = useCostsOverview({
    year: selectedYear,
    companyId: selectedCompanyId,
  });
  
  // Obtener empleados con estado activo
  const { data: employees } = useEmployees({
    activeOnly: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined
  });

  const filteredData = useMemo(() => {
    let filtered = costsData || [];
    
    // Filtrar por estado activo/inactivo
    if (statusFilter !== "all" && employees) {
      const activeEmployeeIds = new Set(employees.map(e => e.id));
      filtered = filtered.filter(e => activeEmployeeIds.has(e.employee_id));
    }
    
    if (selectedDepartmentId !== "all") {
      filtered = filtered.filter(e => e.department_id === selectedDepartmentId);
    }
    
    if (selectedTeamId !== "all") {
      filtered = filtered.filter(e => e.team_id === selectedTeamId);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [costsData, selectedDepartmentId, selectedTeamId, searchTerm, statusFilter, employees]);

  // Generar lista de años (actual - 3 años hacia atrás)
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title="Coste Total de Plantilla"
        subtitle="Desglose completo de costes: salarios, seguridad social y bonus"
      />

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
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

        <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Todos los departamentos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los departamentos</SelectItem>
            {departments?.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Todos los equipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los equipos</SelectItem>
            {teams?.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Activos</SelectItem>
            <SelectItem value="inactive">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Búsqueda */}
      <div>
        <input
          type="text"
          placeholder="Buscar empleado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-96 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
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
        filteredData && (
          <CostsOverviewTable data={filteredData} year={selectedYear} searchTerm={searchTerm} />
        )
      )}
    </div>
  );
};

export default CostsOverview;
