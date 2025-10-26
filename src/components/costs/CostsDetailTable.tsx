import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { EmployeeDrawer } from "@/components/employees/EmployeeDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "./EmptyState";

interface EmployeeDetail {
  id: string;
  name: string;
  company: string;
  bruto: number;
  costeEmpresa: number;
  variation: number;
}

interface CostsDetailTableProps {
  employees: EmployeeDetail[];
  isLoading: boolean;
}

export const CostsDetailTable = ({ employees, isLoading }: CostsDetailTableProps) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const getVariationBadge = (variation: number) => {
    if (variation > 0) {
      return (
        <Badge variant="success">
          <TrendingUp className="w-3 h-3 mr-1" />
          +{variation.toFixed(1)}%
        </Badge>
      );
    } else if (variation < 0) {
      return (
        <Badge variant="destructive">
          <TrendingDown className="w-3 h-3 mr-1" />
          {variation.toFixed(1)}%
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          <Minus className="w-3 h-3 mr-1" />
          0%
        </Badge>
      );
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Card>
    );
  }

  if (employees.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState message="No hay datos de costes para este periodo" />
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Detalle por Empleado ({employees.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="text-right">Bruto</TableHead>
                <TableHead className="text-right">Coste Empresa</TableHead>
                <TableHead className="text-right">Variación %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow
                  key={employee.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedEmployeeId(employee.id)}
                >
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.company}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(employee.bruto)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(employee.costeEmpresa)}
                  </TableCell>
                  <TableCell className="text-right">
                    {getVariationBadge(employee.variation)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <EmployeeDrawer
        employeeId={selectedEmployeeId}
        open={!!selectedEmployeeId}
        onOpenChange={(open) => !open && setSelectedEmployeeId(null)}
      />
    </>
  );
};
