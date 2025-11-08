import { memo, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { formatCurrency, formatMonth } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { RevenueMatrixRow } from "@/hooks/useMonthlyRevenueMatrix";

interface MonthlyRevenuesMatrixProps {
  rows: RevenueMatrixRow[];
  monthsOfYear: string[];
  monthlyTotals: { [key: string]: number };
  grandTotal: number;
  viewMode: "assignee" | "client" | "company";
  onExport: () => void;
  onCellClick?: (row: RevenueMatrixRow, month: string) => void;
}

export const MonthlyRevenuesMatrix = memo(({
  rows,
  monthsOfYear,
  monthlyTotals,
  grandTotal,
  viewMode,
  onExport,
  onCellClick,
}: MonthlyRevenuesMatrixProps) => {
  const columnLabel = useMemo(() => {
    switch (viewMode) {
      case "assignee":
        return "Empleado/Equipo";
      case "client":
        return "Cliente";
      case "company":
        return "Empresa";
    }
  }, [viewMode]);

  const handleCellClick = useCallback((row: RevenueMatrixRow, month: string) => {
    const monthData = row.months[month];
    if (monthData && monthData.amount > 0 && onCellClick) {
      onCellClick(row, month);
    }
  }, [onCellClick]);

  const averageMonthly = useMemo(() => {
    return monthsOfYear.length > 0 ? grandTotal / monthsOfYear.length : 0;
  }, [grandTotal, monthsOfYear.length]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Matriz Mensual de Ingresos</h3>
          <p className="text-sm text-muted-foreground">
            Vista por {columnLabel.toLowerCase()}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
      </div>

      <ScrollArea className="w-full">
        <div className="min-w-[1400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-20 bg-background w-[200px] border-r">
                  {columnLabel}
                </TableHead>
                {monthsOfYear.map((month) => (
                  <TableHead key={month} className="text-right min-w-[110px]">
                    {formatMonth(month + "-01")}
                  </TableHead>
                ))}
                <TableHead className="sticky right-0 z-20 bg-background text-right w-[120px] border-l font-bold">
                  TOTAL
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/50">
                  <TableCell className="sticky left-0 z-10 bg-background font-medium border-r">
                    <div className="flex items-center gap-2">
                      <span>{row.name}</span>
                      {row.type === "unassigned" && (
                        <span className="text-xs text-warning">(Sin asignar)</span>
                      )}
                    </div>
                  </TableCell>
                  {monthsOfYear.map((month) => {
                    const monthData = row.months[month];
                    const value = monthData?.amount || 0;
                    return (
                      <TableCell
                        key={month}
                        className={cn(
                          "text-right tabular-nums",
                          value > 0 && "bg-success/10 cursor-pointer hover:bg-success/20"
                        )}
                        onClick={() => handleCellClick(row, month)}
                      >
                        {value > 0 ? formatCurrency(value) : "—"}
                      </TableCell>
                    );
                  })}
                  <TableCell className="sticky right-0 z-10 bg-background text-right font-bold border-l">
                    {formatCurrency(row.total)}
                  </TableCell>
                </TableRow>
              ))}

              {/* Fila de totales */}
              <TableRow className="bg-muted font-bold">
                <TableCell className="sticky left-0 z-20 bg-muted border-r">
                  TOTAL MES
                </TableCell>
                {monthsOfYear.map((month) => (
                  <TableCell key={month} className="text-right tabular-nums">
                    {formatCurrency(monthlyTotals[month] || 0)}
                  </TableCell>
                ))}
                <TableCell className="sticky right-0 z-20 bg-muted text-right border-l">
                  {formatCurrency(grandTotal)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Total general: <span className="font-bold text-foreground">{formatCurrency(grandTotal)}</span>
        </div>
        <div>
          Promedio mensual: <span className="font-bold text-foreground">{formatCurrency(averageMonthly)}</span>
        </div>
      </div>
    </Card>
  );
});

MonthlyRevenuesMatrix.displayName = "MonthlyRevenuesMatrix";
