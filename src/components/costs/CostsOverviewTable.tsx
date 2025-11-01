import { useState } from "react";
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
import { Download, ArrowUpRight, Settings2, Eye, EyeOff } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CostsOverviewTableProps {
  data: EmployeeAnnualCost[];
  year: number;
  searchTerm?: string;
}

interface ColumnConfig {
  id: string;
  label: string;
  defaultVisible: boolean;
  alwaysVisible?: boolean;
  group?: "basic" | "financial" | "organizational";
}

const AVAILABLE_COLUMNS: ColumnConfig[] = [
  { id: "full_name", label: "Nombre", defaultVisible: true, alwaysVisible: true, group: "basic" },
  { id: "hire_date", label: "Fecha de Alta", defaultVisible: true, group: "basic" },
  { id: "company", label: "Empresa", defaultVisible: true, group: "organizational" },
  { id: "department", label: "Departamento", defaultVisible: true, group: "organizational" },
  { id: "team", label: "Equipo", defaultVisible: true, group: "organizational" },
  { id: "salario_base_anual", label: "Salario Anual", defaultVisible: true, group: "financial" },
  { id: "bruto_cobrado_anual", label: "Bruto Cobrado", defaultVisible: true, group: "financial" },
  { id: "coste_ss_anual", label: "Coste SS", defaultVisible: true, group: "financial" },
  { id: "bonus_pagado_anual", label: "Bonus Pagado", defaultVisible: true, group: "financial" },
  { id: "coste_total_anual", label: "TOTAL", defaultVisible: true, alwaysVisible: true, group: "financial" },
];

const GROUP_LABELS = {
  basic: "Información Básica",
  organizational: "Organización",
  financial: "Datos Financieros",
};

const useColumnVisibility = (storageKey: string) => {
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return new Set(JSON.parse(saved));
    }
    return new Set(
      AVAILABLE_COLUMNS.filter((col) => col.defaultVisible).map((col) => col.id)
    );
  });

  const toggleColumn = (columnId: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        const column = AVAILABLE_COLUMNS.find((c) => c.id === columnId);
        if (column?.alwaysVisible) return prev;
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const resetColumns = () => {
    const defaults = new Set(
      AVAILABLE_COLUMNS.filter((col) => col.defaultVisible).map((col) => col.id)
    );
    setVisibleColumns(defaults);
    localStorage.setItem(storageKey, JSON.stringify(Array.from(defaults)));
  };

  return { visibleColumns, toggleColumn, resetColumns };
};

export const CostsOverviewTable = ({ data, year }: CostsOverviewTableProps) => {
  const { mutateAsync: updateSalary } = useUpdateEmployeeSalary();
  const { mutateAsync: updateDepartment } = useUpdateEmployeeDepartment();
  const { mutateAsync: updateTeam } = useUpdateEmployeeTeam();
  const { data: userRole } = useCurrentUserRole();
  const canEdit = userRole?.canEdit || false;

  const { data: departments } = useDepartments();
  const { data: teams } = useTeams();

  const { visibleColumns, toggleColumn, resetColumns } = useColumnVisibility(
    "costs-overview-columns"
  );

  const isColumnVisible = (columnId: string) => visibleColumns.has(columnId);

  const departmentOptions = departments?.map((d) => ({
    id: d.id,
    label: d.name,
    color: d.color,
  })) || [];

  const teamOptions = teams?.map((t) => ({
    id: t.id,
    label: t.name,
  })) || [];

  const totals = {
    salario: data.reduce((sum, e) => sum + (e.salario_base_anual || 0), 0),
    brutoCobrado: data.reduce((sum, e) => sum + e.bruto_cobrado_anual, 0),
    ss: data.reduce((sum, e) => sum + e.coste_ss_anual, 0),
    bonus: data.reduce((sum, e) => sum + e.bonus_pagado_anual, 0),
    total: data.reduce((sum, e) => sum + e.coste_total_anual, 0),
  };

  const handleExport = () => {
    try {
      exportCostsOverview(data, year, visibleColumns);
      toast.success("Exportación completada");
    } catch (error) {
      toast.error("Error al exportar datos");
      console.error(error);
    }
  };

  const ColumnConfigMenu = () => {
    const groupedColumns = AVAILABLE_COLUMNS.reduce((acc, col) => {
      const group = col.group || "basic";
      if (!acc[group]) acc[group] = [];
      acc[group].push(col);
      return acc;
    }, {} as Record<string, ColumnConfig[]>);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings2 className="h-4 w-4 mr-2" />
            Columnas
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Mostrar/Ocultar Columnas</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {Object.entries(groupedColumns).map(([groupKey, columns]) => (
            <div key={groupKey}>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                {GROUP_LABELS[groupKey as keyof typeof GROUP_LABELS]}
              </div>
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={isColumnVisible(column.id)}
                  onCheckedChange={() => toggleColumn(column.id)}
                  disabled={column.alwaysVisible}
                  className="pl-6"
                >
                  <div className="flex items-center gap-2">
                    {isColumnVisible(column.id) ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                    {column.label}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
            </div>
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={resetColumns}
          >
            Restablecer por defecto
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const basicColumns = ["full_name", "hire_date", "company", "department", "team"];
  const visibleBasicColumns = basicColumns.filter(isColumnVisible);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex-1">
          <CardTitle>Detalle por Empleado</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {data.length} empleados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ColumnConfigMenu />
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {isColumnVisible("full_name") && <TableHead>Nombre</TableHead>}
                {isColumnVisible("hire_date") && <TableHead>Fecha de Alta</TableHead>}
                {isColumnVisible("company") && <TableHead>Empresa</TableHead>}
                {isColumnVisible("department") && <TableHead>Departamento</TableHead>}
                {isColumnVisible("team") && <TableHead>Equipo</TableHead>}
                {isColumnVisible("salario_base_anual") && <TableHead className="text-right">Salario Anual</TableHead>}
                {isColumnVisible("bruto_cobrado_anual") && <TableHead className="text-right">Bruto Cobrado</TableHead>}
                {isColumnVisible("coste_ss_anual") && <TableHead className="text-right">Coste SS</TableHead>}
                {isColumnVisible("bonus_pagado_anual") && <TableHead className="text-right">Bonus Pagado</TableHead>}
                {isColumnVisible("coste_total_anual") && <TableHead className="text-right font-bold">TOTAL</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={Array.from(visibleColumns).length} className="text-center text-muted-foreground">
                    No se encontraron empleados
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {data.map((employee) => (
                    <TableRow key={employee.employee_id} className="group">
                      {isColumnVisible("full_name") && (
                        <TableCell className="font-medium">
                          <Link 
                            to={`/employees/${employee.employee_id}`}
                            className="flex items-center gap-2 hover:text-primary transition-colors"
                          >
                            {employee.full_name}
                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        </TableCell>
                      )}
                      
                      {isColumnVisible("hire_date") && (
                        <TableCell className="text-muted-foreground text-sm">
                          {employee.hire_date 
                            ? format(new Date(employee.hire_date), "dd MMM yyyy", { locale: es })
                            : "—"}
                        </TableCell>
                      )}
                      
                      {isColumnVisible("company") && (
                        <TableCell className="text-muted-foreground">
                          {employee.company}
                        </TableCell>
                      )}
                      
                      {isColumnVisible("department") && (
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
                      )}
                      
                      {isColumnVisible("team") && (
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
                      )}
                      
                      {isColumnVisible("salario_base_anual") && (
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
                            placeholder="Clic para establecer"
                            className={!employee.salario_base_anual ? "text-muted-foreground italic" : ""}
                          />
                        </TableCell>
                      )}
                      
                      {isColumnVisible("bruto_cobrado_anual") && (
                        <TableCell className="text-right">
                          {new Intl.NumberFormat("es-ES", {
                            style: "currency",
                            currency: "EUR",
                            minimumFractionDigits: 0,
                          }).format(employee.bruto_cobrado_anual)}
                        </TableCell>
                      )}
                      
                      {isColumnVisible("coste_ss_anual") && (
                        <TableCell className="text-right">
                          {new Intl.NumberFormat("es-ES", {
                            style: "currency",
                            currency: "EUR",
                            minimumFractionDigits: 0,
                          }).format(employee.coste_ss_anual)}
                        </TableCell>
                      )}
                      
                      {isColumnVisible("bonus_pagado_anual") && (
                        <TableCell className="text-right">
                          {new Intl.NumberFormat("es-ES", {
                            style: "currency",
                            currency: "EUR",
                            minimumFractionDigits: 0,
                          }).format(employee.bonus_pagado_anual)}
                        </TableCell>
                      )}
                      
                      {isColumnVisible("coste_total_anual") && (
                        <TableCell className="text-right font-bold">
                          {new Intl.NumberFormat("es-ES", {
                            style: "currency",
                            currency: "EUR",
                            minimumFractionDigits: 0,
                          }).format(employee.coste_total_anual)}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={visibleBasicColumns.length}>TOTAL</TableCell>
                    {isColumnVisible("salario_base_anual") && (
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 0,
                        }).format(totals.salario)}
                      </TableCell>
                    )}
                    {isColumnVisible("bruto_cobrado_anual") && (
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 0,
                        }).format(totals.brutoCobrado)}
                      </TableCell>
                    )}
                    {isColumnVisible("coste_ss_anual") && (
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 0,
                        }).format(totals.ss)}
                      </TableCell>
                    )}
                    {isColumnVisible("bonus_pagado_anual") && (
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 0,
                        }).format(totals.bonus)}
                      </TableCell>
                    )}
                    {isColumnVisible("coste_total_anual") && (
                      <TableCell className="text-right">
                        {new Intl.NumberFormat("es-ES", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 0,
                        }).format(totals.total)}
                      </TableCell>
                    )}
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
