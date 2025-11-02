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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/formatters";
import type { EmployeeMonthlyRow } from "@/hooks/useMonthlyMatrix";

interface MonthlyCostsMatrixProps {
  rows: EmployeeMonthlyRow[];
  monthsOfYear: string[];
  monthlyTotals: { [key: string]: number };
  grandTotal: number;
  onExport: () => void;
}

export const MonthlyCostsMatrix = ({
  rows,
  monthsOfYear,
  monthlyTotals,
  grandTotal,
  onExport,
}: MonthlyCostsMatrixProps) => {
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
        <ScrollArea className="h-[600px] w-full">
          <div className="min-w-[1400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-20 min-w-[200px]">
                    Empleado
                  </TableHead>
                  {monthsOfYear.map((month) => (
                    <TableHead key={month} className="text-right min-w-[100px]">
                      {getMonthLabel(month)}
                    </TableHead>
                  ))}
                  <TableHead className="text-right font-bold sticky right-[60px] bg-background z-20 min-w-[120px]">
                    TOTAL
                  </TableHead>
                  <TableHead className="sticky right-0 bg-background z-20 w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((employee) => (
                  <TableRow key={employee.employee_id} className="group">
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">
                      <div className="flex flex-col">
                        <span>{employee.full_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {employee.company}
                        </span>
                      </div>
                    </TableCell>
                    {monthsOfYear.map((month) => {
                      const value = employee.months[month] || 0;
                      return (
                        <TableCell
                          key={month}
                          className={`text-right ${
                            value === 0 ? "text-muted-foreground" : ""
                          }`}
                        >
                          {value > 0 ? formatCurrency(value) : "—"}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right font-bold sticky right-[60px] bg-background z-10">
                      {formatCurrency(employee.total)}
                    </TableCell>
                    <TableCell className="sticky right-0 bg-background z-10">
                      <Link to={`/employees/${employee.employee_id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                
                {/* Fila de totales */}
                <TableRow className="bg-muted/50 font-bold border-t-2">
                  <TableCell className="sticky left-0 bg-muted/50 z-10">
                    TOTAL MES
                  </TableCell>
                  {monthsOfYear.map((month) => (
                    <TableCell key={month} className="text-right">
                      {formatCurrency(monthlyTotals[month] || 0)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right sticky right-[60px] bg-muted/50 z-10">
                    {formatCurrency(grandTotal)}
                  </TableCell>
                  <TableCell className="sticky right-0 bg-muted/50 z-10"></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
