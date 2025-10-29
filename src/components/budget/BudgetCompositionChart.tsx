import { memo } from "react";
import { Card } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

interface BudgetCompositionData {
  category: string;
  amount: number;
  color: string;
}

interface BudgetCompositionChartProps {
  data: BudgetCompositionData[];
  title: string;
  total: number;
}

const CustomTooltip = memo(({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value, percent } = payload[0];
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-4">
        <p className="font-semibold text-foreground mb-2">{name}</p>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Importe:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(value)}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Porcentaje:{" "}
            <span className="font-medium text-foreground">
              {formatPercentage(percent * 100, 1)}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
});
CustomTooltip.displayName = "CustomTooltip";

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // No mostrar label si es menor al 5%

  return (
    <text
      x={x}
      y={y}
      fill="hsl(var(--card))"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {formatPercentage(percent * 100, 0)}
    </text>
  );
};

export const BudgetCompositionChart = memo(({ 
  data, 
  title,
  total
}: BudgetCompositionChartProps) => {
  const chartData = data
    .filter(d => d.amount > 0)
    .map(d => ({
      name: d.category,
      value: d.amount,
      color: d.color,
    }));

  if (chartData.length === 0) {
    return (
      <Card className="p-6 border border-border backdrop-blur-sm bg-card/50">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">
              Distribución por categorías
            </p>
          </div>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-sm text-muted-foreground">Sin datos disponibles</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border border-border backdrop-blur-sm bg-card/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">
            Distribución por categorías · Total: {formatCurrency(total)}
          </p>
        </div>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value, entry: any) => (
                  <span className="text-sm text-foreground">
                    {value} ({formatCurrency(entry.payload.value)})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
});

BudgetCompositionChart.displayName = "BudgetCompositionChart";
