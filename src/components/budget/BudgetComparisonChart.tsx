import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";

interface BudgetComparisonData {
  period: string;
  budgetedIncome: number;
  actualIncome: number;
  budgetedExpenses: number;
  actualExpenses: number;
  budgetedResult: number;
  actualResult: number;
}

interface BudgetComparisonChartProps {
  data: BudgetComparisonData[];
  type?: 'income' | 'expenses' | 'result' | 'all';
}

const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-4">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry.name}:{" "}
              <span className="font-medium text-foreground">
                {formatCurrency(entry.value)}
              </span>
            </p>
          ))}
        </div>
      </div>
    );
  }
  return null;
});
CustomTooltip.displayName = "CustomTooltip";

export const BudgetComparisonChart = memo(({ 
  data, 
  type = 'all' 
}: BudgetComparisonChartProps) => {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      name: d.period,
      ...(type === 'income' || type === 'all' ? {
        "Ingreso Pres.": d.budgetedIncome,
        "Ingreso Real": d.actualIncome,
      } : {}),
      ...(type === 'expenses' || type === 'all' ? {
        "Gasto Pres.": d.budgetedExpenses,
        "Gasto Real": d.actualExpenses,
      } : {}),
      ...(type === 'result' || type === 'all' ? {
        "Resultado Pres.": d.budgetedResult,
        "Resultado Real": d.actualResult,
      } : {}),
    }));
  }, [data, type]);

  const getTitle = () => {
    switch (type) {
      case 'income':
        return 'Comparativa de Ingresos';
      case 'expenses':
        return 'Comparativa de Gastos';
      case 'result':
        return 'Comparativa de Resultados';
      default:
        return 'Comparativa General';
    }
  };

  return (
    <Card className="p-6 border border-border backdrop-blur-sm bg-card/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            {getTitle()}
          </h3>
          <p className="text-sm text-muted-foreground">
            Presupuestado vs Real por período
          </p>
        </div>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
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
                wrapperStyle={{ paddingTop: 20 }}
                iconType="circle"
              />
              {(type === 'income' || type === 'all') && (
                <>
                  <Bar
                    dataKey="Ingreso Pres."
                    fill="hsl(var(--primary))"
                    opacity={0.7}
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar
                    dataKey="Ingreso Real"
                    fill="hsl(var(--success))"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                </>
              )}
              {(type === 'expenses' || type === 'all') && (
                <>
                  <Bar
                    dataKey="Gasto Pres."
                    fill="hsl(var(--destructive))"
                    opacity={0.7}
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar
                    dataKey="Gasto Real"
                    fill="hsl(var(--warning))"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                </>
              )}
              {type === 'result' && (
                <>
                  <Bar
                    dataKey="Resultado Pres."
                    fill="hsl(var(--primary))"
                    opacity={0.7}
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                  <Bar
                    dataKey="Resultado Real"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={60}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
});

BudgetComparisonChart.displayName = "BudgetComparisonChart";
