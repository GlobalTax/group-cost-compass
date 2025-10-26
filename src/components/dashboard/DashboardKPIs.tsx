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
      bgColor: "bg-primary-light",
      iconColor: "text-primary",
    },
    {
      title: "Empleados Activos",
      value: activeEmployees.toString(),
      icon: Users,
      bgColor: "bg-purple-light",
      iconColor: "text-purple",
    },
    {
      title: "Coste Medio por Empleado",
      value: formatCurrency(avgCostPerEmployee),
      icon: TrendingUp,
      bgColor: "bg-success-light",
      iconColor: "text-success",
    },
    {
      title: "% Subida Salarial Anual",
      value: formatPercentage(salaryIncreasePercent),
      icon: ArrowUpCircle,
      bgColor: "bg-warning-light",
      iconColor: "text-warning-foreground",
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
