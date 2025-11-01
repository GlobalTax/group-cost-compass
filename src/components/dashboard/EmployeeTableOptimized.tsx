import { memo } from "react";
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
import { ArrowUpRight } from "lucide-react";
import { useEmployeeCostsSummary } from "@/hooks/useEmployeeCostsSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";

interface EmployeeTableOptimizedProps {
  filters?: {
    companyId?: string;
    year?: number;
  };
}

/**
 * Versión optimizada de EmployeeTable que usa vw_employee_annual
 * - Reduce complejidad de O(n*m) a O(n)
 * - Sin cálculos en frontend, todo en SQL
 */
export const EmployeeTableOptimized = memo(({ filters }: EmployeeTableOptimizedProps) => {
  const { data: employees, isLoading } = useEmployeeCostsSummary(filters);

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
        <p>No hay empleados con costes registrados para este año</p>
        <p className="text-sm mt-2">
          Importa datos desde A3Nom
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
            <TableHead className="font-semibold text-right">Salario Base Anual</TableHead>
            <TableHead className="font-semibold text-right">Total Cobrado</TableHead>
            <TableHead className="font-semibold text-right">Bonus Pagado</TableHead>
            <TableHead className="font-semibold text-right">Coste SS</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <Link 
              key={employee.employee_id}
              to={`/employees/${employee.employee_id}`}
              className="contents"
            >
              <TableRow className="group cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">{employee.full_name}</TableCell>
                <TableCell>
                  <span className="text-sm text-foreground">
                    {employee.company || "—"}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {employee.salario_base_anual ? formatCurrency(employee.salario_base_anual) : "—"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {employee.bruto_cobrado_anual > 0 ? formatCurrency(employee.bruto_cobrado_anual) : "—"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {employee.bonus_pagado_anual > 0 ? formatCurrency(employee.bonus_pagado_anual) : "—"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {employee.coste_ss_anual > 0 ? formatCurrency(employee.coste_ss_anual) : "—"}
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

EmployeeTableOptimized.displayName = "EmployeeTableOptimized";
