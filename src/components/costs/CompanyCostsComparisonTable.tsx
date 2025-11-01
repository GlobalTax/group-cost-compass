import { useMemo } from "react";
import { Download, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyCostsComparison } from "@/hooks/useCompanyCostsComparison";
import { formatCurrency } from "@/lib/formatters";
import { exportCompanyCostsToCSV } from "@/lib/exporters/companyCostsExporter";
import { cn } from "@/lib/utils";

interface CompanyCostsComparisonTableProps {
  year: number;
  month?: number;
  companyId?: string;
}

export const CompanyCostsComparisonTable = ({
  year,
  month,
  companyId,
}: CompanyCostsComparisonTableProps) => {
  const { data, isLoading } = useCompanyCostsComparison({ year, month, companyId });

  const totals = useMemo(() => {
    if (!data) return null;
    
    return {
      num_employees_current: data.reduce((sum, c) => sum + c.num_employees_current, 0),
      num_employees_previous: data.reduce((sum, c) => sum + c.num_employees_previous, 0),
      coste_mensual: data.reduce((sum, c) => sum + c.coste_mensual_actual, 0),
      coste_acumulado_ytd: data.reduce((sum, c) => sum + c.coste_acumulado_ytd, 0),
      coste_acumulado_anterior: data.reduce((sum, c) => sum + c.coste_acumulado_year_anterior, 0),
      variacion_euros: data.reduce((sum, c) => sum + c.variacion_euros, 0),
    };
  }, [data]);

  const handleExport = () => {
    if (data) {
      exportCompanyCostsToCSV(data, year, month);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Costes por Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay datos disponibles para el período seleccionado
          </p>
        </CardContent>
      </Card>
    );
  }

  const periodLabel = month 
    ? new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(new Date(year, month - 1))
    : `Acumulado ${year}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Costes por Empresa - {periodLabel}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead className="text-right">Nº Empleados {year}</TableHead>
              <TableHead className="text-right">Variación Empleados</TableHead>
              <TableHead className="text-right">Coste Mes Actual</TableHead>
              <TableHead className="text-right">Acumulado {year}</TableHead>
              <TableHead className="text-right text-muted-foreground">
                Acumulado {year - 1}
              </TableHead>
              <TableHead className="text-right">Variación Costes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((company) => (
              <TableRow key={company.company_id}>
                <TableCell className="font-medium">{company.company_name}</TableCell>
                <TableCell className="text-right">
                  {company.num_employees_current}
                </TableCell>
                <TableCell className="text-right">
                  {company.num_employees_previous > 0 ? (
                    <div className="flex items-center justify-end gap-2">
                      {company.variacion_empleados_absoluta > 0 ? (
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      ) : company.variacion_empleados_absoluta < 0 ? (
                        <TrendingDown className="h-4 w-4 text-orange-600" />
                      ) : (
                        <span className="w-4" />
                      )}
                      <div className="flex flex-col items-end">
                        <span className={cn(
                          "font-medium",
                          company.variacion_empleados_absoluta > 0 && "text-blue-600",
                          company.variacion_empleados_absoluta < 0 && "text-orange-600"
                        )}>
                          {company.variacion_empleados_absoluta > 0 ? "+" : ""}
                          {company.variacion_empleados_absoluta}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {company.variacion_empleados_percent > 0 ? "+" : ""}
                          {company.variacion_empleados_percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(company.coste_mensual_actual)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(company.coste_acumulado_ytd)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {company.coste_acumulado_year_anterior > 0 
                    ? formatCurrency(company.coste_acumulado_year_anterior)
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {company.coste_acumulado_year_anterior > 0 ? (
                    <div className="flex items-center justify-end gap-2">
                      {company.variacion_percent > 0 ? (
                        <TrendingUp className="h-4 w-4 text-destructive" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-success" />
                      )}
                      <div className="flex flex-col items-end">
                        <span
                          className={
                            company.variacion_percent > 0
                              ? "text-destructive font-medium"
                              : "text-success font-medium"
                          }
                        >
                          {company.variacion_percent > 0 ? "+" : ""}
                          {company.variacion_percent.toFixed(1)}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {company.variacion_euros > 0 ? "+" : ""}
                          {formatCurrency(company.variacion_euros)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {/* Fila de TOTALES */}
            {totals && (
              <TableRow className="bg-primary/5 font-bold border-t-2">
                <TableCell className="font-bold">TOTAL GRUPO</TableCell>
                <TableCell className="text-right">
                  {totals.num_employees_current}
                </TableCell>
                <TableCell className="text-right">
                  {totals.num_employees_previous > 0 ? (
                    <div className="flex items-center justify-end gap-2">
                      {(totals.num_employees_current - totals.num_employees_previous) > 0 ? (
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      ) : (totals.num_employees_current - totals.num_employees_previous) < 0 ? (
                        <TrendingDown className="h-4 w-4 text-orange-600" />
                      ) : (
                        <span className="w-4" />
                      )}
                      <span className={cn(
                        "font-bold",
                        (totals.num_employees_current - totals.num_employees_previous) > 0 && "text-blue-600",
                        (totals.num_employees_current - totals.num_employees_previous) < 0 && "text-orange-600"
                      )}>
                        {(totals.num_employees_current - totals.num_employees_previous) > 0 ? "+" : ""}
                        {totals.num_employees_current - totals.num_employees_previous}
                      </span>
                    </div>
                  ) : (
                    <span>—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totals.coste_mensual)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totals.coste_acumulado_ytd)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {totals.coste_acumulado_anterior > 0 
                    ? formatCurrency(totals.coste_acumulado_anterior)
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {totals.coste_acumulado_anterior > 0 ? (
                    <div className="flex items-center justify-end gap-2">
                      {totals.variacion_euros > 0 ? (
                        <TrendingUp className="h-4 w-4 text-destructive" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-success" />
                      )}
                      <span
                        className={
                          totals.variacion_euros > 0
                            ? "text-destructive"
                            : "text-success"
                        }
                      >
                        {totals.variacion_euros > 0 ? "+" : ""}
                        {formatCurrency(totals.variacion_euros)}
                      </span>
                    </div>
                  ) : (
                    <span>—</span>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="justify-end">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </CardFooter>
    </Card>
  );
};
