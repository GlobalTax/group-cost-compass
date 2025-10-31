import { memo } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { TrendingUp, DollarSign, Users, Target } from "lucide-react";

interface CompensationKPIsProps {
  totalFixedSalary: number;
  totalBonusPaid: number;
  variablePercentage: number;
  activeEmployees: number;
}

export const CompensationKPIs = memo(({
  totalFixedSalary,
  totalBonusPaid,
  variablePercentage,
  activeEmployees,
}: CompensationKPIsProps) => {
  const totalCompensation = totalFixedSalary + totalBonusPaid;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
        <div className="rounded-full bg-primary/10 p-3">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Masa Salarial Fija</p>
          <p className="text-2xl font-semibold">
            {new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "EUR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(totalFixedSalary)}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
        <div className="rounded-full bg-success/10 p-3">
          <Target className="h-5 w-5 text-success" />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Bonus Pagados YTD</p>
          <p className="text-2xl font-semibold">
            {new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "EUR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(totalBonusPaid)}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
        <div className="rounded-full bg-warning/10 p-3">
          <TrendingUp className="h-5 w-5 text-warning" />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">% Variable sobre Fijo</p>
          <p className="text-2xl font-semibold">{variablePercentage.toFixed(1)}%</p>
        </div>
      </div>

      <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
        <div className="rounded-full bg-accent/10 p-3">
          <Users className="h-5 w-5 text-accent" />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Compensación Total</p>
          <p className="text-2xl font-semibold">
            {new Intl.NumberFormat("es-ES", {
              style: "currency",
              currency: "EUR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(totalCompensation)}
          </p>
        </div>
      </div>
    </div>
  );
});

CompensationKPIs.displayName = "CompensationKPIs";
