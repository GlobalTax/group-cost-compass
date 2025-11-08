import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { useBudgetPersonnelCosts } from "@/hooks/useBudgetPersonnelCosts";

interface BudgetPersonnelCostsTableProps {
  period: string;
  companyId: string | null;
}

export function BudgetPersonnelCostsTable({ period, companyId }: BudgetPersonnelCostsTableProps) {
  const { data: costs = [], isLoading } = useBudgetPersonnelCosts(period, companyId);

  const total = costs.reduce((sum, cost) => sum + (cost.coste_empresa || 0), 0);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">
          Costes de Personal del Período
        </h3>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-semibold">{formatCurrency(total)}</p>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead className="text-right">Bruto</TableHead>
              <TableHead className="text-right">Coste Empresa</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  No hay costes de personal en este período
                </TableCell>
              </TableRow>
            ) : (
              costs.map((cost) => (
                <TableRow key={cost.id}>
                  <TableCell>{cost.hr_employees?.full_name || "Sin nombre"}</TableCell>
                  <TableCell className="text-right">{formatCurrency(cost.bruto || 0)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(cost.coste_empresa || 0)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
