import { useState } from "react";
import { Card } from "@/components/ui/card";
import { EmployeeTable } from "@/components/dashboard/EmployeeTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { PageHeader } from "@/components/layout/PageHeader";

const Employees = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o puesto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Employee List */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Plantilla</h2>
          <Card className="p-6 border-gray-200">
            <EmployeeTable filters={{ searchTerm }} />
          </Card>
        </div>
      </div>
    </>
  );
};

export default Employees;
