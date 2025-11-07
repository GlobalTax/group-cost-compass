import { Card } from "@/components/ui/card";
import { TrendingUp, Repeat, Users, DollarSign } from "lucide-react";

interface RevenueKPIsProps {
  totalRevenue: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
  topContributors: number;
}

export const RevenueKPIs = ({
  totalRevenue,
  recurringRevenue,
  oneTimeRevenue,
  topContributors,
}: RevenueKPIsProps) => {
  const recurringPercentage = totalRevenue > 0 
    ? ((recurringRevenue / totalRevenue) * 100).toFixed(1)
    : '0';

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ingresos Totales</p>
            <p className="text-2xl font-semibold">
              {totalRevenue.toLocaleString('es-ES', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Repeat className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Recurrentes</p>
            <p className="text-2xl font-semibold">
              {recurringRevenue.toLocaleString('es-ES', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
              })}
            </p>
            <p className="text-xs text-muted-foreground">{recurringPercentage}% del total</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">No Recurrentes</p>
            <p className="text-2xl font-semibold">
              {oneTimeRevenue.toLocaleString('es-ES', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Top Contribuyentes</p>
            <p className="text-2xl font-semibold">{topContributors}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
