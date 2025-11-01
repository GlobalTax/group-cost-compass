import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, ArrowUpRight } from "lucide-react";
import { exportCostsOverview } from "@/lib/exporters/costsOverviewExporter";
import type { EmployeeAnnualCost } from "@/hooks/useCostsOverview";
import { toast } from "sonner";
import { EditableCell } from "@/components/ui/editable-cell";
import { EditableSelectCell } from "@/components/ui/editable-select-cell";
import { useUpdateEmployeeSalary } from "@/hooks/useUpdateEmployeeSalary";
import { useUpdateEmployeeDepartment } from "@/hooks/useUpdateEmployeeDepartment";
import { useUpdateEmployeeTeam } from "@/hooks/useUpdateEmployeeTeam";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { useDepartments } from "@/hooks/useDepartments";
import { useTeams } from "@/hooks/useTeams";
import { Badge } from "@/components/ui/badge";

interface CostsOverviewTableProps {
  data: EmployeeAnnualCost[];
  year: number;
  searchTerm?: string;
}

export const CostsOverviewTable = ({ data, year, searchTerm = "" }: CostsOverviewTableProps) => {
  const { mutateAsync: updateSalary } = useUpdateEmployeeSalary();
  const { mutateAsync: updateDepartment } = useUpdateEmployeeDepartment();
  const { mutateAsync: updateTeam } = useUpdateEmployeeTeam();
  const { data: userRole } = useCurrentUserRole();
  const canEdit = userRole?.canEdit || false;

  const { data: departments } = useDepartments();
  const { data: teams } = useTeams();

  const departmentOptions = departments?.map((d) => ({
    id: d.id,
    label: d.name,
    color: d.color,
  })) || [];

  const teamOptions = teams?.map((t) => ({
    id: t.id,
    label: t.name,
  })) || [];

  // Calcular totales
  const totals = {
    salario: data.reduce((sum, e) => sum + (e.salario_base_anual || 0), 0),
    brutoCobrado: data.reduce((sum, e) => sum + e.bruto_cobrado_anual, 0),
    ss: data.reduce((sum, e) => sum + e.coste_ss_anual, 0),
    bonus: data.reduce((sum, e) => sum + e.bonus_pagado_anual, 0),
    total: data.reduce((sum, e) => sum + e.coste_total_anual, 0),
  };

  const handleExport = () => {
    try {
      exportCostsOverview(data, year);
      toast.success("Exportación completada");
    } catch (error) {
      toast.error("Error al exportar datos");
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex-1">
          <CardTitle>Detalle por Empleado</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {data.length} empleados
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead className="text-right">Salario Anual</TableHead>
                <TableHead className="text-right">Bruto Cobrado</TableHead>
                <TableHead className="text-right">Coste SS</TableHead>
                <TableHead className="text-right">Bonus Pagado</TableHead>
                <TableHead className="text-right font-bold">TOTAL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No se encontraron empleados
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {data.map((employee) => (
                    <TableRow key={employee.employee_id} className="group">
                      <TableCell className="font-medium">
                        <Link 
                          to={`/employees/${employee.employee_id}`}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          {employee.full_name}
                          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {employee.company}
                      </TableCell>
                      <TableCell>
                        <EditableSelectCell
                          value={employee.department_id}
                          displayValue={employee.department_name}
                          options={departmentOptions}
                          onSave={async (newDepartmentId) => {
                            await updateDepartment({
                              employeeId: employee.employee_id,
                              newDepartmentId,
                              oldDepartmentId: employee.department_id,
                            });
                          }}
                          disabled={!canEdit}
                          placeholder="Sin departamento"
                          renderDisplay={(option) => (
                            <Badge
                              style={{
                                backgroundColor: option.color || "#6366f1",
                                color: "white",
                              }}
                            >
                              {option.label}
                            </Badge>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <EditableSelectCell
                          value={employee.team_id}
                          displayValue={employee.team_name}
                          options={teamOptions}
                          onSave={async (newTeamId) => {
                            await updateTeam({
                              employeeId: employee.employee_id,
                              newTeamId,
                              oldTeamId: employee.team_id,
                            });
                          }}
                          disabled={!canEdit}
                          placeholder="Sin equipo"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <EditableCell
                          value={employee.salario_base_anual}
                          onSave={async (newValue) => {
                            await updateSalary({
                              employeeId: employee.employee_id,
                              newSalary: newValue,
                              oldSalary: employee.salario_base_anual,
                            });
                          }}
                          format="currency"
                          min={0}
                          max={500000}
                          disabled={!canEdit}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 0,
                        }).format(employee.bruto_cobrado_anual)}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 0,
                        }).format(employee.coste_ss_anual)}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 0,
                        }).format(employee.bonus_pagado_anual)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 0,
                        }).format(employee.coste_total_anual)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Fila de totales */}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={4}>TOTAL</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                      }).format(totals.salario)}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                      }).format(totals.brutoCobrado)}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                      }).format(totals.ss)}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                      }).format(totals.bonus)}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("es-ES", {
                        style: "currency",
                        currency: "EUR",
                        minimumFractionDigits: 0,
                      }).format(totals.total)}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
