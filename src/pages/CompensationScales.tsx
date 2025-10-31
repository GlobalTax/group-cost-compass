import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Scale } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SalaryScalesTable } from "@/components/compensation/SalaryScalesTable";
import { CompensationBandDialog } from "@/components/compensation/CompensationBandDialog";
import { OutOfBandAlert } from "@/components/compensation/OutOfBandAlert";

const DEPARTMENTS = [
  { value: "all", label: "Todos los departamentos" },
  { value: "M&A", label: "M&A" },
  { value: "Ventas", label: "Ventas" },
  { value: "Operaciones", label: "Operaciones" },
  { value: "Tech", label: "Tech" },
  { value: "Finanzas", label: "Finanzas" },
  { value: "RRHH", label: "RRHH" },
  { value: "Marketing", label: "Marketing" },
];

export default function CompensationScales() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Baremos de Retribución"
          subtitle="Define rangos salariales por departamento y nivel"
        />
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Baremo
        </Button>
      </div>

      <OutOfBandAlert />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Bandas Salariales
              </CardTitle>
              <CardDescription>
                Gestiona los rangos de compensación por categoría profesional
              </CardDescription>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Filtrar por departamento" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <SalaryScalesTable
            department={selectedDepartment === "all" ? undefined : selectedDepartment}
          />
        </CardContent>
      </Card>

      <CompensationBandDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
