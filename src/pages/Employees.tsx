import { useState } from "react";
import { Card } from "@/components/ui/card";
import { EmployeeTable } from "@/components/dashboard/EmployeeTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Upload, Download, Search, Filter } from "lucide-react";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { Badge } from "@/components/ui/badge";

const Employees = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      <EmployeeDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Empleados</h1>
            <p className="text-muted-foreground mt-1">
              Gestión completa de la plantilla del grupo
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Empleado
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="apollo-card p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empleados..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {showFilters && (
                <Badge variant="secondary" className="ml-2">2</Badge>
              )}
            </Button>
          </div>
        </Card>

        {/* Employee List */}
        <Card className="apollo-card p-6">
          <EmployeeTable filters={{ searchTerm }} />
        </Card>
      </div>
    </>
  );
};

export default Employees;
