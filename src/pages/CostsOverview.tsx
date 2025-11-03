import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CostsOverviewKPIs } from "@/components/costs/CostsOverviewKPIs";
import { CostsOverviewTable } from "@/components/costs/CostsOverviewTable";
import { DuplicateCleanupDialog } from "@/components/employees/DuplicateCleanupDialog";
import { useCostsOverview } from "@/hooks/useCostsOverview";
import { useEmployees } from "@/hooks/useEmployees";
import { useCompanies } from "@/hooks/useCompanies";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeams } from "@/hooks/useTeams";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MultiSelectFilter } from "@/components/ui/multi-select-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Building2, X, Users } from "lucide-react";

const CostsOverview = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);

  const { data: companies } = useCompanies();
  const { data: departments } = useDepartments();
  const { data: teams } = useTeams({ 
    departmentId: selectedDepartmentIds.length === 1 ? selectedDepartmentIds[0] : undefined 
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
    
    if (selectedDepartmentIds.length > 0) {
      filtered = filtered.filter(e => 
        e.department_id && selectedDepartmentIds.includes(e.department_id)
      );
    }
    
    if (selectedTeamIds.length > 0) {
      filtered = filtered.filter(e => 
        e.team_id && selectedTeamIds.includes(e.team_id)
      );
    }
    
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [costsData, selectedDepartmentIds, selectedTeamIds, searchTerm, statusFilter, employees]);

  // Generar lista de años (actual - 3 años hacia atrás)
  const years = Array.from({ length: 4 }, (_, i) => currentYear - i);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Coste Total de Plantilla"
          subtitle="Desglose completo de costes: salarios, seguridad social y bonus"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCleanupDialogOpen(true)}
          className="gap-2"
        >
          <Copy className="w-4 h-4" />
          Limpiar Duplicados
        </Button>
      </div>

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

        <MultiSelectFilter
          label="Departamentos"
          options={departments?.map(dept => ({ id: dept.id, name: dept.name })) || []}
          selectedIds={selectedDepartmentIds}
          onChange={setSelectedDepartmentIds}
          placeholder="Todos los departamentos"
          emptyMessage="No hay departamentos disponibles"
          icon={<Building2 className="h-4 w-4" />}
        />

        <MultiSelectFilter
          label="Equipos"
          options={teams?.map(team => ({ id: team.id, name: team.name })) || []}
          selectedIds={selectedTeamIds}
          onChange={setSelectedTeamIds}
          placeholder="Todos los equipos"
          emptyMessage="No hay equipos disponibles"
          icon={<Users className="h-4 w-4" />}
        />

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

      {/* Badges de filtros activos */}
      {(selectedDepartmentIds.length > 0 || selectedTeamIds.length > 0) && (
        <div className="flex flex-wrap gap-3">
          {selectedDepartmentIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Departamentos:</span>
              {departments
                ?.filter(dept => selectedDepartmentIds.includes(dept.id))
                .map(dept => (
                  <Badge key={dept.id} variant="secondary" className="gap-1">
                    {dept.name}
                    <button
                      onClick={() => {
                        setSelectedDepartmentIds(prev => 
                          prev.filter(id => id !== dept.id)
                        );
                      }}
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
            </div>
          )}
          {selectedTeamIds.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Equipos:</span>
              {teams
                ?.filter(team => selectedTeamIds.includes(team.id))
                .map(team => (
                  <Badge key={team.id} variant="secondary" className="gap-1">
                    {team.name}
                    <button
                      onClick={() => {
                        setSelectedTeamIds(prev => 
                          prev.filter(id => id !== team.id)
                        );
                      }}
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
            </div>
          )}
        </div>
      )}

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

      <DuplicateCleanupDialog
        open={cleanupDialogOpen}
        onOpenChange={setCleanupDialogOpen}
      />
    </div>
  );
};

export default CostsOverview;
