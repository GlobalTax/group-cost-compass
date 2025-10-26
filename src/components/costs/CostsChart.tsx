import { Card } from "@/components/ui/card";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";

interface ChartDataPoint {
  month: string;
  bruto: number;
  coste: number;
  employees: number;
}

interface CostsChartProps {
  data: ChartDataPoint[];
}

export const CostsChart = ({ data }: CostsChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-4">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === "Empleados" ? entry.value : formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6" id="costs-chart-title">
        Evolución Últimos 12 Meses
      </h2>
      <div 
        role="img" 
        aria-labelledby="costs-chart-title"
        aria-describedby="costs-chart-desc"
      >
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: "hsl(var(--foreground))" }}
              stroke="hsl(var(--border))"
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: "hsl(var(--foreground))" }}
              stroke="hsl(var(--border))"
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: "hsl(var(--foreground))" }}
              stroke="hsl(var(--border))"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Bar 
              yAxisId="left"
              dataKey="bruto" 
              fill="hsl(var(--primary))" 
              name="Bruto"
              stackId="a"
            />
            <Bar 
              yAxisId="left"
              dataKey="coste" 
              fill="hsl(var(--success))" 
              name="Coste Empresa"
              stackId="a"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="employees" 
              stroke="hsl(var(--warning))" 
              strokeWidth={2}
              name="Empleados"
              dot={{ fill: "hsl(var(--warning))", r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <p id="costs-chart-desc" className="sr-only">
        Gráfico de barras y línea mostrando la evolución de costes brutos, costes empresa y número de empleados durante los últimos 12 meses.
      </p>
    </Card>
  );
};
