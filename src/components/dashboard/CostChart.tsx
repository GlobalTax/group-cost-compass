import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface CostChartProps {
  type: "monthly" | "yearly";
  data: { period: string; bruto: number; coste: number }[];
}

// Mock data
const monthlyData = [
  { month: "Ene", bruto: 95000, coste: 120000 },
  { month: "Feb", bruto: 98000, coste: 123000 },
  { month: "Mar", bruto: 102000, coste: 128000 },
  { month: "Abr", bruto: 101000, coste: 127000 },
  { month: "May", bruto: 104000, coste: 131000 },
  { month: "Jun", bruto: 106000, coste: 133000 },
  { month: "Jul", bruto: 105000, coste: 132000 },
  { month: "Ago", bruto: 103000, coste: 129000 },
  { month: "Sep", bruto: 108000, coste: 136000 },
  { month: "Oct", bruto: 110000, coste: 138000 },
  { month: "Nov", bruto: 112000, coste: 141000 },
  { month: "Dic", bruto: 115000, coste: 145000 },
];

const yearlyData = [
  { year: "2022", bruto: 980000, coste: 1230000 },
  { year: "2023", bruto: 1120000, coste: 1410000 },
  { year: "2024", bruto: 1234000, coste: 1560000 },
  { year: "2025", bruto: 1340000, coste: 1690000 },
];

export const CostChart = ({ type, data }: CostChartProps) => {
  const chartData = data.length > 0 ? data.map(d => ({
    name: d.period.substring(5, 7), // MM
    bruto: d.bruto,
    coste: d.coste,
  })) : (type === "monthly" ? monthlyData : yearlyData);
  
  const xKey = type === "monthly" ? "month" : "year";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        {type === "monthly" ? (
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey={xKey}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-card)",
              }}
              formatter={(value: number) => formatCurrency(value)}
              labelStyle={{ fontWeight: 600, marginBottom: 8 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              iconType="circle"
              formatter={(value) =>
                value === "bruto" ? "Bruto" : "Coste Empresa"
              }
            />
            <Bar
              dataKey="bruto"
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
            <Bar
              dataKey="coste"
              fill="hsl(var(--primary-glow))"
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey={xKey}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-card)",
              }}
              formatter={(value: number) => formatCurrency(value)}
              labelStyle={{ fontWeight: 600, marginBottom: 8 }}
            />
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              iconType="circle"
              formatter={(value) =>
                value === "bruto" ? "Bruto" : "Coste Empresa"
              }
            />
            <Line
              type="monotone"
              dataKey="bruto"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", r: 5 }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="coste"
              stroke="hsl(var(--primary-glow))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary-glow))", r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};
