import { memo, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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

export const EmployeeTable = memo(({ filters }: EmployeeTableProps) => {
  const { data: employees, isLoading } = useEmployees(filters);
  const { data: allCosts } = useEmployeeCosts();

  // CRITICAL OPTIMIZATION: Calculate all employee costs in a single pass
  // From O(n*m) to O(n+m) complexity
  const employeeCostsMap = useMemo(() => {
    if (!allCosts || !employees) return new Map();

    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    const costsMap = new Map<string, { brutoAnual: number; costeAnual: number; changePercent: number | null }>();

    employees.forEach((employee) => {
      const currentYearCosts = allCosts.filter(
        (c) => c.employee_id === employee.id && c.period.startsWith(currentYear.toString())
      );
      
      const previousYearCosts = allCosts.filter(
        (c) => c.employee_id === employee.id && c.period.startsWith(previousYear.toString())
      );

      const brutoAnual = currentYearCosts.reduce((sum, c) => sum + (c.bruto || 0), 0);
      const costeAnual = currentYearCosts.reduce((sum, c) => sum + (c.coste_empresa || 0), 0);
      const brutoPreviousYear = previousYearCosts.reduce((sum, c) => sum + (c.bruto || 0), 0);
      
      const changePercent = brutoPreviousYear > 0
        ? ((brutoAnual - brutoPreviousYear) / brutoPreviousYear) * 100
        : null;

      costsMap.set(employee.id, { brutoAnual, costeAnual, changePercent });
    });

    return costsMap;
  }, [allCosts, employees]);

  // O(1) lookup instead of O(m) filtering per employee
  const getEmployeeCosts = useCallback((employeeId: string) => {
    return employeeCostsMap.get(employeeId) || { brutoAnual: 0, costeAnual: 0, changePercent: null };
  }, [employeeCostsMap]);

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
            const { brutoAnual, costeAnual, changePercent } = getEmployeeCosts(employee.id);
            const isActive = !employee.termination_date;

            return (
              <Link 
                key={employee.id}
                to={`/employees/${employee.id}`}
                className="contents"
              >
                <TableRow className="group cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{employee.full_name}</TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">
                      {employee.companies?.name || "—"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{formatDate(employee.hire_date)}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-foreground">
                      {employee.termination_date
                        ? formatDate(employee.termination_date)
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {brutoAnual > 0 ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">
                            {formatCurrency(brutoAnual)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {changePercent !== null ? (
                            <p className="text-xs">
                              Cambio vs. año anterior: {changePercent > 0 ? "+" : ""}
                              {changePercent.toFixed(1)}%
                            </p>
                          ) : (
                            <p className="text-xs">Sin datos del año anterior</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      "—"
                    )}
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
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </Link>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
});

EmployeeTable.displayName = "EmployeeTable";
