import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { formatCurrency, formatPercentage } from "@/lib/formatters";

interface BudgetTrendData {
  period: string;
  budgeted: number;
  actual: number;
}

interface BudgetTrendChartProps {
  data: BudgetTrendData[];
  title: string;
  type: 'income' | 'expenses' | 'result';
}

const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const budgeted = payload[0]?.value || 0;
    const actual = payload[1]?.value || 0;
    const deviation = budgeted !== 0 ? ((actual - budgeted) / budgeted) * 100 : 0;
    const isPositive = deviation >= 0;

    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-4">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            Presupuestado:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(budgeted)}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Real:{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(actual)}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Desviación:{" "}
            <span 
              className={`font-medium ${
                isPositive ? 'text-success' : 'text-destructive'
              }`}
            >
              {formatPercentage(deviation)}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
});
CustomTooltip.displayName = "CustomTooltip";

export const BudgetTrendChart = memo(({ 
  data, 
  title,
  type
}: BudgetTrendChartProps) => {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      name: d.period,
      Presupuestado: d.budgeted,
      Real: d.actual,
    }));
  }, [data]);

  const getLineColor = () => {
    switch (type) {
      case 'income':
        return 'hsl(var(--success))';
      case 'expenses':
        return 'hsl(var(--destructive))';
      default:
        return 'hsl(var(--primary))';
    }
  };

  return (
    <Card className="p-6 border border-border backdrop-blur-sm bg-card/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            Tendencia mensual presupuestado vs real
          </p>
        </div>
        <div className="w-full h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <defs>
                <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getLineColor()} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={getLineColor()} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.3} 
              />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 10 }}
                iconType="circle"
              />
              <Area
                type="monotone"
                dataKey="Presupuestado"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill={`url(#gradient-${type})`}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="Real"
                stroke={getLineColor()}
                strokeWidth={3}
                dot={{ fill: getLineColor(), r: 5 }}
                activeDot={{ r: 7 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
});

BudgetTrendChart.displayName = "BudgetTrendChart";
