import { useState } from "react";
import { Card } from "@/components/ui/card";
import { EmployeeTableOptimized } from "@/components/dashboard/EmployeeTableOptimized";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCompanies } from "@/hooks/useCompanies";
import { useEmployees } from "@/hooks/useEmployees";
import { Badge } from "@/components/ui/badge";

const Employees = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: companies } = useCompanies();

  const filters = {
    searchTerm,
    companyId: companyFilter !== "all" ? companyFilter : undefined,
    activeOnly: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined,
  };

  const { data: employees = [] } = useEmployees(filters);
  
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => !emp.termination_date).length;
  const inactiveEmployees = employees.filter(emp => emp.termination_date).length;

  return (
    <>
      <EmployeeDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      
      <div className="p-8 space-y-6">
        <PageHeader
          title="Empleados"
          subtitle="Gestión de plantilla y costes laborales"
          action={
            <Button variant="black" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Empleado
            </Button>
          }
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground" />
            <Input
              placeholder="Buscar por nombre o puesto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={companyFilter} onValueChange={setCompanyFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Employee Counter */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold text-lg text-foreground">{totalEmployees}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Badge variant="success">Activos</Badge>
            <span className="font-medium text-foreground">{activeEmployees}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Inactivos</Badge>
            <span className="font-medium text-foreground">{inactiveEmployees}</span>
          </div>
        </div>

        {/* Employee List */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Plantilla</h2>
          <Card className="p-6 border-gray-200">
            <EmployeeTableOptimized 
              filters={{ 
                companyId: companyFilter !== "all" ? companyFilter : undefined, 
                year: new Date().getFullYear(),
                searchTerm: searchTerm,
                activeOnly: statusFilter === "active" ? true : statusFilter === "inactive" ? false : undefined
              }} 
            />
          </Card>
        </div>
      </div>
    </>
  );
};

export default Employees;
