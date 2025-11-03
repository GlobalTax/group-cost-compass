import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ArrowUpRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/formatters";
import { EditableCell } from "@/components/ui/editable-cell";
import { useUpdateCostInMatrix } from "@/hooks/useUpdateCostInMatrix";
import type { EmployeeMonthlyRow } from "@/hooks/useMonthlyMatrix";

interface MonthlyCostsMatrixProps {
  rows: EmployeeMonthlyRow[];
  monthsOfYear: string[];
  monthlyTotals: { [key: string]: number };
  grandTotal: number;
  onExport: () => void;
  costType: "bruto" | "total";
}

export const MonthlyCostsMatrix = ({
  rows,
  monthsOfYear,
  monthlyTotals,
  grandTotal,
  onExport,
  costType,
}: MonthlyCostsMatrixProps) => {
  const { updateCostValue, isLoading } = useUpdateCostInMatrix();
  const getMonthLabel = (period: string) => {
    const [_, month] = period.split("-");
    const monthNames = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];
    return monthNames[parseInt(month) - 1];
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Matriz de Costes Mensuales</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {rows.length} empleados × {monthsOfYear.length} meses
          </p>
        </div>
        <Button onClick={onExport} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[600px] w-full">
          <div className="overflow-x-auto pb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-30 min-w-[200px] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    Empleado
                  </TableHead>
                  {monthsOfYear.map((month) => (
                    <TableHead key={month} className="text-right min-w-[90px]">
                      {getMonthLabel(month)}
                    </TableHead>
                  ))}
                  <TableHead className="text-right font-bold sticky right-0 bg-background z-30 min-w-[140px] px-4 shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    TOTAL
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((employee) => (
                  <TableRow key={employee.employee_id} className="group">
                    <TableCell className="sticky left-0 bg-background z-20 font-medium shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{employee.full_name}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {employee.company}
                          </span>
                        </div>
                        <Link to={`/employees/${employee.employee_id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 h-7 w-7 flex-shrink-0"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                    {monthsOfYear.map((month) => {
                      const costData = employee.months[month];
                      const value = costData?.value || 0;
                      const costId = costData?.cost_id;

                      return (
                        <TableCell
                          key={month}
                          className={`text-right ${value === 0 ? "text-muted-foreground" : ""}`}
                        >
                          {costId ? (
                            <EditableCell
                              value={value}
                              format="currency"
                              min={0}
                              max={500000}
                              disabled={isLoading}
                              onSave={async (newValue) => {
                                const field = costType === "bruto" ? "bruto" : "coste_empresa";
                                await updateCostValue(costId, field, newValue);
                              }}
                            />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right font-bold sticky right-0 bg-background z-20 px-4 font-tabular-nums shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                      {formatCurrency(employee.total)}
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Fila de totales */}
                <TableRow className="bg-muted font-bold border-t-2 border-border">
                  <TableCell className="sticky left-0 bg-muted z-20 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    TOTAL MES
                  </TableCell>
                  {monthsOfYear.map((month) => (
                    <TableCell key={month} className="text-right">
                      {formatCurrency(monthlyTotals[month] || 0)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right sticky right-0 bg-muted z-20 px-4 font-tabular-nums shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                    {formatCurrency(grandTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
