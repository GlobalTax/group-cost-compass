import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface SalaryIncreasesTabProps {
  costs: Array<{
    period: string;
    bruto: number | null;
  }>;
}

export const SalaryIncreasesTab = ({ costs }: SalaryIncreasesTabProps) => {
  const currentYear = new Date().getFullYear();

  if (!costs || costs.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-center text-muted-foreground">
          No hay datos suficientes para calcular subidas salariales
        </p>
      </Card>
    );
  }

  // Calculate yearly totals
  const yearlyTotals = costs.reduce((acc, cost) => {
    const year = cost.period.substring(0, 4);
    if (!acc[year]) {
      acc[year] = { year, total: 0, months: 0 };
    }
    acc[year].total += cost.bruto || 0;
    acc[year].months += 1;
    return acc;
  }, {} as Record<string, { year: string; total: number; months: number }>);

  // Calculate year-over-year changes
  const increases = Object.values(yearlyTotals)
    .sort((a, b) => b.year.localeCompare(a.year))
    .map((current, index, array) => {
      const previous = array[index + 1];
      let change = null;
      let changePercent = null;

      if (previous) {
        change = current.total - previous.total;
        changePercent = (change / previous.total) * 100;
      }

      const monthlyAvg = current.months > 0 ? current.total / current.months : 0;

      return {
        year: current.year,
        amount: current.total,
        months: current.months,
        monthlyAvg,
        change,
        changePercent,
      };
    });

  return (
    <div className="space-y-4">
      {increases.map((item) => {
        const isCurrentYear = parseInt(item.year) === currentYear;
        
        return (
          <Card key={item.year} className={isCurrentYear ? "border-primary" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-2xl font-bold">{item.year}</h4>
                      {isCurrentYear && (
                        <Badge variant="default" className="bg-primary">
                          Año actual
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.months} {item.months === 1 ? "mes" : "meses"} registrados
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">
                      {formatCurrency(item.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatCurrency(item.monthlyAvg)}/mes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {item.changePercent !== null && (
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1">
                        {item.changePercent > 0 ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-success" />
                            <Badge variant="default" className="bg-success text-success-foreground">
                              +{item.changePercent.toFixed(1)}%
                            </Badge>
                          </>
                        ) : item.changePercent < 0 ? (
                          <>
                            <TrendingDown className="w-4 h-4 text-destructive" />
                            <Badge variant="destructive">
                              {item.changePercent.toFixed(1)}%
                            </Badge>
                          </>
                        ) : (
                          <>
                            <Minus className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="secondary">
                              0%
                            </Badge>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.change && item.change > 0 ? "+" : ""}
                        {item.change ? formatCurrency(item.change) : ""} vs. anterior
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
