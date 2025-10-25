import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPeriod } from "@/lib/formatters";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CostsTabProps {
  costs: Array<{
    id: string;
    period: string;
    bruto: number | null;
    coste_empresa: number | null;
  }>;
  isLoading?: boolean;
}

export const CostsTab = ({ costs, isLoading }: CostsTabProps) => {
  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!costs || costs.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-center text-foreground">
          No hay costes registrados para este empleado
        </p>
      </Card>
    );
  }

  // Prepare last 24 months of data for chart
  const sortedCosts = [...costs].sort((a, b) => a.period.localeCompare(b.period));
  const last24Months = sortedCosts.slice(-24);

  const chartData = last24Months.map((cost) => ({
    period: new Date(cost.period).toLocaleDateString("es-ES", { month: "short", year: "2-digit" }),
    Bruto: cost.bruto || 0,
    "Coste Empresa": cost.coste_empresa || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Mini Chart */}
      <Card className="p-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">Últimos 24 Meses</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
              stroke="hsl(var(--border))"
            />
            <YAxis 
              tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
              stroke="hsl(var(--border))"
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                fontSize: "12px",
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            <Legend 
              wrapperStyle={{ fontSize: "12px" }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="Bruto"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: "#2563eb", r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Coste Empresa"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: "#10b981", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Costs Table */}
      <Card className="p-6">
        <h4 className="text-sm font-semibold text-foreground mb-4">Detalle Mensual</h4>
        <div className="rounded-lg border max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Período</TableHead>
                <TableHead className="font-semibold text-right">Bruto Mensual</TableHead>
                <TableHead className="font-semibold text-right">Coste Empresa</TableHead>
                <TableHead className="font-semibold text-right">Ratio</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCosts.reverse().map((cost) => {
                const ratio = cost.bruto ? (cost.coste_empresa || 0) / cost.bruto : 0;
                return (
                  <TableRow key={cost.id}>
                    <TableCell className="font-medium">
                      {formatPeriod(cost.period)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(cost.bruto || 0)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(cost.coste_empresa || 0)}
                    </TableCell>
                    <TableCell className="text-right text-sm text-foreground">
                      {ratio.toFixed(2)}x
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
