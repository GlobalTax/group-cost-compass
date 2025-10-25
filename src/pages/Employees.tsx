import { Card } from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmployeeTable } from "@/components/dashboard/EmployeeTable";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download } from "lucide-react";

const Employees = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Empleados</h1>
            <p className="text-muted-foreground mt-1">
              Gestión completa de la plantilla del grupo
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <Button className="gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Empleado
            </Button>
          </div>
        </div>

        {/* Employee List */}
        <Card className="glass-card p-6">
          <EmployeeTable />
        </Card>
      </main>
    </div>
  );
};

export default Employees;
