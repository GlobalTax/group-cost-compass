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

interface CompanyData {
  id: string;
  name: string;
  bruto: number;
  coste: number;
  employees: number;
}

interface DashboardCompanyChartProps {
  data: CompanyData[];
  onCompanyClick?: (companyId: string) => void;
}

export const DashboardCompanyChart = ({
  data,
  onCompanyClick,
}: DashboardCompanyChartProps) => {
  const chartData = data.map((d) => ({
    name: d.name.length > 15 ? d.name.substring(0, 15) + "..." : d.name,
    fullName: d.name,
    id: d.id,
    Bruto: d.bruto,
    "Coste Empresa": d.coste,
    Empleados: d.employees,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-4">
          <p className="font-semibold text-foreground mb-2">
            {payload[0].payload.fullName}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Bruto: <span className="font-medium text-primary">{formatCurrency(payload[0].value)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Coste: <span className="font-medium text-primary-glow">{formatCurrency(payload[1].value)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Empleados: <span className="font-medium text-foreground">{payload[2].value}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    if (onCompanyClick && data?.id) {
      onCompanyClick(data.id);
    }
  };

  return (
    <Card className="p-6 border border-border backdrop-blur-sm bg-card/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Costes por Empresa
          </h3>
          <p className="text-sm text-muted-foreground">
            Desglose de bruto, coste empresa y empleados activos
          </p>
        </div>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                yAxisId="cost"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="employees"
                orientation="right"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: 20 }}
                iconType="circle"
              />
              <Bar
                yAxisId="cost"
                dataKey="Bruto"
                fill="hsl(var(--primary))"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
                onClick={handleBarClick}
                cursor="pointer"
              />
              <Bar
                yAxisId="cost"
                dataKey="Coste Empresa"
                fill="hsl(217 91% 75%)"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
                onClick={handleBarClick}
                cursor="pointer"
              />
              <Line
                yAxisId="employees"
                type="monotone"
                dataKey="Empleados"
                stroke="hsl(var(--success))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--success))", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};
