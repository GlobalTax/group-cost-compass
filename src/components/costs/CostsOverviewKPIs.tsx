import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Briefcase, Calculator, Receipt } from "lucide-react";
import type { EmployeeAnnualCost } from "@/hooks/useCostsOverview";

interface CostsOverviewKPIsProps {
  data: EmployeeAnnualCost[];
}

export const CostsOverviewKPIs = ({ data }: CostsOverviewKPIsProps) => {
  // Calcular totales
  const totalSalarios = data.reduce((sum, e) => sum + (e.salario_base_anual || 0), 0);
  const totalBrutoCobrado = data.reduce((sum, e) => sum + e.bruto_cobrado_anual, 0);
  const totalSS = data.reduce((sum, e) => sum + e.coste_ss_anual, 0);
  const totalBonus = data.reduce((sum, e) => sum + e.bonus_pagado_anual, 0);
  const totalCoste = data.reduce((sum, e) => sum + e.coste_total_anual, 0);

  const kpis = [
    {
      title: "Salarios Anuales",
      value: totalSalarios,
      icon: DollarSign,
      description: "Salarios base negociados",
    },
    {
      title: "Bruto Cobrado",
      value: totalBrutoCobrado,
      icon: Receipt,
      description: "Total pagado en nóminas",
    },
    {
      title: "Coste SS",
      value: totalSS,
      icon: TrendingUp,
      description: "Costes SS empresa",
    },
    {
      title: "Bonus Pagados",
      value: totalBonus,
      icon: Briefcase,
      description: "Total bonus abonados",
    },
    {
      title: "COSTE TOTAL PLANTILLA",
      value: totalCoste,
      icon: Calculator,
      description: "Coste total empresa",
      highlight: true,
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card 
            key={kpi.title}
            className={kpi.highlight ? "border-primary shadow-lg" : ""}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={`text-sm font-medium ${kpi.highlight ? "text-primary" : ""}`}>
                {kpi.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${kpi.highlight ? "text-primary" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${kpi.highlight ? "text-primary" : ""}`}>
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "EUR",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(kpi.value)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
