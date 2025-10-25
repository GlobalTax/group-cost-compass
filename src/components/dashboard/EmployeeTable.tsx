import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useEmployeeCosts } from "@/hooks/useEmployeeCosts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/formatters";

interface EmployeeTableProps {
  filters?: {
    companyId?: string;
    searchTerm?: string;
    activeOnly?: boolean;
  };
}

export const EmployeeTable = ({ filters }: EmployeeTableProps) => {
  const navigate = useNavigate();
  const { data: employees, isLoading } = useEmployees(filters);
  const { data: allCosts } = useEmployeeCosts();

  // Calculate annual costs for each employee
  const getEmployeeAnnualCosts = (employeeId: string) => {
    const currentYear = new Date().getFullYear();
    const employeeCosts = allCosts?.filter(
      (c) =>
        c.employee_id === employeeId &&
        c.period.startsWith(currentYear.toString())
    );

    const brutoAnual = employeeCosts?.reduce(
      (sum, c) => sum + (c.bruto || 0),
      0
    );
    const costeAnual = employeeCosts?.reduce(
      (sum, c) => sum + (c.coste_empresa || 0),
      0
    );

    return { brutoAnual: brutoAnual || 0, costeAnual: costeAnual || 0 };
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No hay empleados registrados</p>
        <p className="text-sm mt-2">
          Importa datos desde A3Nom o crea empleados manualmente
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold">Nombre</TableHead>
            <TableHead className="font-semibold">Empresa</TableHead>
            <TableHead className="font-semibold">Alta</TableHead>
            <TableHead className="font-semibold">Baja</TableHead>
            <TableHead className="font-semibold text-right">Bruto Anual</TableHead>
            <TableHead className="font-semibold text-right">Coste Anual</TableHead>
            <TableHead className="font-semibold text-center">Estado</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => {
            const { brutoAnual, costeAnual } = getEmployeeAnnualCosts(employee.id);
            const isActive = !employee.termination_date;

            return (
              <TableRow
                key={employee.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/employees/${employee.id}`)}
              >
                <TableCell className="font-medium">{employee.full_name}</TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {employee.companies?.name || "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{formatDate(employee.hire_date)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {employee.termination_date
                      ? formatDate(employee.termination_date)
                      : "—"}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {brutoAnual > 0 ? formatCurrency(brutoAnual) : "—"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {costeAnual > 0 ? formatCurrency(costeAnual) : "—"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Badge
                      variant={isActive ? "default" : "secondary"}
                      className={isActive ? "bg-success" : ""}
                    >
                      {isActive ? "Activo" : "Inactivo"}
                    </Badge>
                    {employee.transfer_group && (
                      <Badge variant="outline" className="border-primary text-primary">
                        Traslado
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => navigate(`/employees/${employee.id}`)}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
