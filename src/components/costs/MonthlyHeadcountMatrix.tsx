import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { HeadcountRow } from "@/hooks/useMonthlyHeadcount";

interface MonthlyHeadcountMatrixProps {
  rows: HeadcountRow[];
  monthsOfYear: string[];
  monthlyTotals: { [key: string]: number };
  grandTotal: number;
  onExport: () => void;
}

export const MonthlyHeadcountMatrix = ({
  rows,
  monthsOfYear,
  monthlyTotals,
  grandTotal,
  onExport,
}: MonthlyHeadcountMatrixProps) => {
  const getMonthLabel = (period: string) => {
    const [, month] = period.split("-");
    const monthNames = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    return monthNames[parseInt(month) - 1];
  };

  const getVariationColor = (current: number, previous: number) => {
    if (current > previous) return "text-success";
    if (current < previous) return "text-destructive";
    return "text-muted-foreground";
  };

  const getVariationIcon = (current: number, previous: number) => {
    if (current > previous) return "↑";
    if (current < previous) return "↓";
    return "→";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Plantilla Mensual</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {rows.length} empresas • {monthsOfYear.length} meses
          </p>
        </div>
        <Button onClick={onExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative h-[600px] w-full overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="min-w-full pb-4">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-30 min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    Empresa
                  </TableHead>
                  {monthsOfYear.map((month) => (
                    <TableHead key={month} className="text-right min-w-[90px]">
                      {getMonthLabel(month)}
                    </TableHead>
                  ))}
                  <TableHead className="text-right font-bold sticky right-0 bg-background z-30 min-w-[140px] px-4 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    PROMEDIO
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((company) => (
                  <TableRow key={company.company_id}>
                    <TableCell className="sticky left-0 bg-background z-20 font-medium shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                      <div className="flex flex-col">
                        <span className="truncate">{company.company_name}</span>
                        <span className="text-xs text-muted-foreground">
                          Max: {company.maxMonth} | Min: {company.minMonth}
                        </span>
                      </div>
                    </TableCell>
                    {monthsOfYear.map((month, idx) => {
                      const count = company.months[month] || 0;
                      const prevMonth = idx > 0 ? monthsOfYear[idx - 1] : null;
                      const prevCount = prevMonth ? company.months[prevMonth] || 0 : count;
                      const variation = count - prevCount;

                      return (
                        <TableCell
                          key={month}
                          className="text-right font-tabular-nums"
                        >
                          <div className="flex flex-col items-end">
                            <span className="font-medium">{count}</span>
                            {idx > 0 && variation !== 0 && (
                              <span
                                className={`text-xs ${getVariationColor(count, prevCount)}`}
                              >
                                {getVariationIcon(count, prevCount)}
                                {Math.abs(variation)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right font-bold sticky right-0 bg-background z-20 px-4 font-tabular-nums shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                      {company.total.toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted font-bold border-t-2 border-border">
                  <TableCell className="sticky left-0 bg-muted z-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    TOTAL
                  </TableCell>
                  {monthsOfYear.map((month, idx) => {
                    const count = monthlyTotals[month] || 0;
                    const prevMonth = idx > 0 ? monthsOfYear[idx - 1] : null;
                    const prevCount = prevMonth ? monthlyTotals[prevMonth] || 0 : count;
                    const variation = count - prevCount;

                    return (
                      <TableCell
                        key={month}
                        className="text-right font-tabular-nums"
                      >
                        <div className="flex flex-col items-end">
                          <span className="font-bold">{count}</span>
                          {idx > 0 && variation !== 0 && (
                            <span
                              className={`text-xs ${getVariationColor(count, prevCount)}`}
                            >
                              {getVariationIcon(count, prevCount)}
                              {Math.abs(variation)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-right sticky right-0 bg-muted z-20 px-4 font-tabular-nums shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    {grandTotal.toFixed(1)}
                  </TableCell>
                </TableRow>
              </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};
