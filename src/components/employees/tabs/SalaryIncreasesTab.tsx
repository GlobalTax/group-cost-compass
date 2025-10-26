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
  if (!costs || costs.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-center text-foreground">
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

      return {
        year: current.year,
        amount: current.total,
        months: current.months,
        change,
        changePercent,
      };
    });

  return (
    <div className="space-y-4">
      {increases.map((item) => (
        <Card key={item.year}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h4 className="text-2xl font-bold text-foreground">{item.year}</h4>
                  <p className="text-xs text-foreground mt-1">{item.months} meses</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(item.amount)}
                  </p>
                  {item.changePercent !== null && (
                    <div className="flex items-center gap-1 mt-1">
                      {item.changePercent > 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-success" />
                          <Badge variant="success" className="text-xs">
                            +{item.changePercent.toFixed(1)}%
                          </Badge>
                        </>
                      ) : item.changePercent < 0 ? (
                        <>
                          <TrendingDown className="w-4 h-4 text-destructive" />
                          <Badge variant="destructive" className="text-xs">
                            {item.changePercent.toFixed(1)}%
                          </Badge>
                        </>
                      ) : (
                        <>
                          <Minus className="w-4 h-4 text-gray-600" />
                          <Badge variant="secondary" className="text-xs">
                            0%
                          </Badge>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {item.change !== null && (
                <div className="text-right">
                  <p className="text-sm text-foreground font-medium">
                    {item.change > 0 ? "+" : ""}
                    {formatCurrency(item.change)}
                  </p>
                  <p className="text-xs text-foreground">vs. año anterior</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
