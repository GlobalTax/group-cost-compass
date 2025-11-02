import { memo, useState } from "react";
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
import { ArrowUpRight, AlertCircle, Trash2, Copy } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEmployeesWithCosts } from "@/hooks/useEmployeesWithCosts";
import { useDeleteEmployee } from "@/hooks/useEmployees";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";

interface EmployeeTableOptimizedProps {
  filters?: {
    companyId?: string;
    year?: number;
    searchTerm?: string;
    activeOnly?: boolean;
  };
}

/**
 * Versión optimizada de EmployeeTable que usa vw_employee_annual
 * - Reduce complejidad de O(n*m) a O(n)
 * - Sin cálculos en frontend, todo en SQL
 */
export const EmployeeTableOptimized = memo(({ filters }: EmployeeTableOptimizedProps) => {
  const { data: employees, isLoading } = useEmployeesWithCosts(filters);
  const deleteMutation = useDeleteEmployee();
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    employeeId: string | null;
    employeeName: string | null;
    hasCosts: boolean;
  }>({
    open: false,
    employeeId: null,
    employeeName: null,
    hasCosts: false,
  });

  // Detectar duplicados por nombre + empresa
  const getDuplicateCount = (name: string, companyId: string) => {
    return employees?.filter(
      e => e.full_name === name && e.company_id === companyId
    ).length || 0;
  };

  const handleDeleteClick = (
    e: React.MouseEvent,
    employeeId: string,
    employeeName: string,
    hasCosts: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteDialog({
      open: true,
      employeeId,
      employeeName,
      hasCosts,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.employeeId) return;
    
    await deleteMutation.mutateAsync(deleteDialog.employeeId);
    setDeleteDialog({ open: false, employeeId: null, employeeName: null, hasCosts: false });
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
          Crea un empleado o importa datos desde A3Nom
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
            <TableHead className="w-[100px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => {
            const hasCostData = employee.bruto_cobrado_anual !== null;
            const duplicateCount = getDuplicateCount(employee.full_name, employee.company_id);
            const isDuplicate = duplicateCount > 1;

            return (
              <TableRow 
                key={employee.employee_id}
                className="group hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Link 
                      to={`/employees/${employee.employee_id}`}
                      className="hover:underline"
                    >
                      {employee.full_name}
                    </Link>
                    
                    {!hasCostData && (
                      <Badge variant="outline" className="text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Sin datos
                      </Badge>
                    )}
                    
                    {isDuplicate && (
                      <Badge variant="destructive" className="text-xs">
                        <Copy className="w-3 h-3 mr-1" />
                        Duplicado ({duplicateCount})
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-foreground">
                    {employee.company}
                  </span>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {employee.salario_base_anual ? formatCurrency(employee.salario_base_anual) : "—"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {employee.bruto_cobrado_anual ? formatCurrency(employee.bruto_cobrado_anual) : "—"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {employee.bonus_pagado_anual ? formatCurrency(employee.bonus_pagado_anual) : "—"}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {employee.coste_ss_anual ? formatCurrency(employee.coste_ss_anual) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/employees/${employee.employee_id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </Link>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteClick(
                        e,
                        employee.employee_id,
                        employee.full_name,
                        hasCostData
                      )}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                      title="Eliminar empleado"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => 
        !open && setDeleteDialog({ open: false, employeeId: null, employeeName: null, hasCosts: false })
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar empleado?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar a <strong>{deleteDialog.employeeName}</strong>.
              
              {deleteDialog.hasCosts ? (
                <>
                  <br /><br />
                  <span className="text-destructive font-semibold">
                    ⚠️ Este empleado tiene costes registrados.
                  </span>
                  <br />
                  No se puede eliminar hasta que se borren todos sus registros de nómina.
                </>
              ) : (
                <>
                  <br /><br />
                  Esta acción <strong className="text-destructive">no se puede deshacer</strong>.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            {!deleteDialog.hasCosts && (
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

EmployeeTableOptimized.displayName = "EmployeeTableOptimized";
