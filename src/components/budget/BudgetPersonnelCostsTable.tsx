import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BudgetPersonnelCostsTableProps {
  period: string;
  companyId: string | null;
}

export function BudgetPersonnelCostsTable({ period, companyId }: BudgetPersonnelCostsTableProps) {
  const { data: costs = [], isLoading } = useQuery({
    queryKey: ["personnelCosts", period, companyId],
    queryFn: async () => {
      let query = supabase
        .from("hr_employee_costs")
        .select(`
          id,
          period,
          bruto,
          coste_empresa,
          hr_employees (
            id,
            full_name,
            company_id
          )
        `)
        .gte("period", period)
        .lt("period", new Date(new Date(period).setMonth(new Date(period).getMonth() + 1)).toISOString().split('T')[0])
        .order("coste_empresa", { ascending: false });

      if (companyId) {
        query = query.eq("hr_employees.company_id", companyId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

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
