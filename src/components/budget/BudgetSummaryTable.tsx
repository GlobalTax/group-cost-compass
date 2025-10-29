import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BudgetSummaryTableProps {
  data: any[];
}

export function BudgetSummaryTable({ data }: BudgetSummaryTableProps) {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      draft: "secondary",
      approved: "default",
      closed: "outline",
    };

    const labels: Record<string, string> = {
      draft: "Borrador",
      approved: "Aprobado",
      closed: "Cerrado",
    };

    return <Badge variant={variants[status] || "default"}>{labels[status] || status}</Badge>;
  };

  const formatPeriod = (period: string) => {
    try {
      return format(new Date(period), "MMMM yyyy", { locale: es });
    } catch {
      return period;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Periodo</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Ingresos Presup.</TableHead>
            <TableHead className="text-right">Ingresos Real</TableHead>
            <TableHead className="text-right">Gastos Presup.</TableHead>
            <TableHead className="text-right">Gastos Real</TableHead>
            <TableHead className="text-right">Resultado Presup.</TableHead>
            <TableHead className="text-right">Resultado Real</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                No hay presupuestos disponibles
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{formatPeriod(row.period)}</TableCell>
                <TableCell>{row.company_name || "Consolidado"}</TableCell>
                <TableCell>{getStatusBadge(row.status)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.budgeted_income)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.actual_income)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.total_budgeted_expenses)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.total_actual_expenses)}</TableCell>
                <TableCell className="text-right">{formatCurrency(row.budgeted_result)}</TableCell>
                <TableCell className="text-right font-semibold">{formatCurrency(row.actual_result)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/budget/${row.id}`)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
