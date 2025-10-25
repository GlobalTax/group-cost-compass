import { Card } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { TrendingUp, Users, DollarSign, ArrowUpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardKPIsProps {
  costeTotal: number;
  activeEmployees: number;
  avgCostPerEmployee: number;
  salaryIncreasePercent: number;
}

export const DashboardKPIs = ({
  costeTotal,
  activeEmployees,
  avgCostPerEmployee,
  salaryIncreasePercent,
}: DashboardKPIsProps) => {
  const kpis = [
    {
      title: "Coste Total Anual",
      value: formatCurrency(costeTotal),
      icon: DollarSign,
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Empleados Activos",
      value: activeEmployees.toString(),
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Coste Medio por Empleado",
      value: formatCurrency(avgCostPerEmployee),
      icon: TrendingUp,
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "% Subida Salarial Anual",
      value: formatPercentage(salaryIncreasePercent),
      icon: ArrowUpCircle,
      gradient: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      change: salaryIncreasePercent > 0 ? "positive" : salaryIncreasePercent < 0 ? "negative" : "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card
            key={index}
            className={cn(
              "p-6 border border-border hover:shadow-lg transition-all duration-300",
              "backdrop-blur-sm bg-card/50"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </p>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {kpi.value}
                </p>
              </div>
              <div className={cn("p-3 rounded-lg", kpi.bgColor)}>
                <Icon className={cn("w-6 h-6", kpi.iconColor)} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
