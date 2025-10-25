import { Card } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: number;
  format?: "currency" | "number" | "percentage";
  icon: LucideIcon;
  trend?: number;
  className?: string;
}

export const KPICard = ({
  title,
  value,
  format = "number",
  icon: Icon,
  trend,
  className,
}: KPICardProps) => {
  const formatValue = (val: number, type: string) => {
    switch (type) {
      case "currency":
        return new Intl.NumberFormat("es-ES", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case "percentage":
        return `${val.toFixed(1)}%`;
      default:
        return val.toString();
    }
  };

  const isPositiveTrend = trend && trend > 0;
  const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;

  return (
    <Card className={cn("p-6 transition-all hover:shadow-elevated", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isPositiveTrend ? "text-success" : "text-destructive"
            )}
          >
            <TrendIcon className="w-4 h-4" />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-3xl font-bold tracking-tight">
          {formatValue(value, format)}
        </p>
      </div>
    </Card>
  );
};
