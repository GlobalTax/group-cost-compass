import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface HeatmapData {
  month: string;
  avgCostPerEmployee: number;
  employees: number;
}

interface DashboardHeatmapProps {
  data: HeatmapData[];
}

export const DashboardHeatmap = ({ data }: DashboardHeatmapProps) => {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  // Normalize data to get color intensity
  const maxCost = Math.max(...data.map((d) => d.avgCostPerEmployee), 1);
  const minCost = Math.min(...data.map((d) => d.avgCostPerEmployee), 0);

  const getIntensity = (value: number) => {
    if (maxCost === minCost) return 0.5;
    return (value - minCost) / (maxCost - minCost);
  };

  const getColorClass = (intensity: number) => {
    if (intensity < 0.2) return "bg-blue-100 text-blue-800";
    if (intensity < 0.4) return "bg-blue-200 text-blue-900";
    if (intensity < 0.6) return "bg-blue-300 text-blue-900";
    if (intensity < 0.8) return "bg-blue-400 text-blue-950";
    return "bg-blue-500 text-white";
  };

  // Map data by month number
  const dataByMonth = data.reduce((acc, d) => {
    const monthNum = parseInt(d.month.substring(5, 7));
    acc[monthNum] = d;
    return acc;
  }, {} as Record<number, HeatmapData>);

  return (
    <Card className="p-6 border border-border backdrop-blur-sm bg-card/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Heatmap de Coste Medio Mensual
          </h3>
          <p className="text-sm text-muted-foreground">
            Coste medio por empleado a lo largo del año
          </p>
        </div>
        <div className="grid grid-cols-6 lg:grid-cols-12 gap-3">
          {months.map((month, index) => {
            const monthData = dataByMonth[index + 1];
            const intensity = monthData ? getIntensity(monthData.avgCostPerEmployee) : 0;
            const colorClass = monthData ? getColorClass(intensity) : "bg-muted text-muted-foreground";

            return (
              <div
                key={index}
                className={cn(
                  "aspect-square rounded-lg p-2 flex flex-col items-center justify-center",
                  "transition-all duration-200 hover:scale-105 hover:shadow-md cursor-pointer",
                  colorClass
                )}
                title={
                  monthData
                    ? `${month}: ${formatCurrency(monthData.avgCostPerEmployee)} (${monthData.employees} empleados)`
                    : `${month}: Sin datos`
                }
              >
                <div className="text-xs font-medium">{month}</div>
                {monthData && (
                  <div className="text-[10px] font-bold mt-1">
                    {(monthData.avgCostPerEmployee / 1000).toFixed(0)}k
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-4 h-4 rounded bg-blue-100 border border-border" />
            <span>Bajo</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-4 h-4 rounded bg-blue-500 border border-border" />
            <span>Alto</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
