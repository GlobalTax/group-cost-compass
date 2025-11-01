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
    if (!data || data.length === 0) return null;

    const totalEmployeesCurrent = data.reduce((sum, c) => sum + c.num_employees_current, 0);
    const totalEmployeesPrevious = data.reduce((sum, c) => sum + c.num_employees_previous, 0);
    const totalCosteMensual = data.reduce((sum, c) => sum + c.coste_mensual_actual, 0);
    const totalCosteMensualAnterior = data.reduce((sum, c) => sum + c.coste_mensual_anterior, 0);
    const totalCosteAcumuladoYTD = data.reduce((sum, c) => sum + c.coste_acumulado_ytd, 0);
    const totalCosteAcumuladoAnterior = data.reduce((sum, c) => sum + c.coste_acumulado_year_anterior, 0);
    const totalVariacionEuros = totalCosteAcumuladoYTD - totalCosteAcumuladoAnterior;
    const totalVariacionMensualEuros = totalCosteMensual - totalCosteMensualAnterior;

    const empDiff = totalEmployeesCurrent - totalEmployeesPrevious;
    const empPercent = totalEmployeesPrevious > 0
      ? (empDiff / totalEmployeesPrevious) * 100
      : 0;

    const totalVariacionPercent = totalCosteAcumuladoAnterior > 0
      ? ((totalVariacionEuros / totalCosteAcumuladoAnterior) * 100)
      : 0;

    return {
      totalEmployeesCurrent,
      totalEmployeesPrevious,
      totalCosteMensual,
      totalCosteMensualAnterior,
      totalCosteAcumuladoYTD,
      totalCosteAcumuladoAnterior,
      totalVariacionEuros,
      totalVariacionMensualEuros,
      totalVariacionPercent,
      empDiff,
      empPercent,
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
              <TableHead className="text-right">Coste Mes {month ? `${month}/${year}` : year}</TableHead>
              <TableHead className="text-right text-muted-foreground">
                Coste Mes {month ? `${month}/${year - 1}` : year - 1}
              </TableHead>
              <TableHead className="text-right">Variación Mensual</TableHead>
              <TableHead className="text-right">Acumulado {year}</TableHead>
              <TableHead className="text-right text-muted-foreground">
                Acumulado {year - 1}
              </TableHead>
              <TableHead className="text-right">Variación Acumulado</TableHead>
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

                {/* Coste Mensual Actual */}
                <TableCell className="text-right font-medium">
                  {formatCurrency(company.coste_mensual_actual)}
                </TableCell>

                {/* Coste Mensual Año Anterior */}
                <TableCell className="text-right text-muted-foreground">
                  {company.coste_mensual_anterior > 0
                    ? formatCurrency(company.coste_mensual_anterior)
                    : "—"}
                </TableCell>

                {/* Variación Mensual */}
                <TableCell className="text-right">
                  {company.coste_mensual_anterior > 0 ? (
                    <div className="flex items-center justify-end gap-2">
                      {company.variacion_mensual_absoluta > 0 ? (
                        <TrendingUp className="h-4 w-4 text-destructive" />
                      ) : company.variacion_mensual_absoluta < 0 ? (
                        <TrendingDown className="h-4 w-4 text-success" />
                      ) : null}
                      <div className="flex flex-col items-end">
                        <span
                          className={cn(
                            "font-medium",
                            company.variacion_mensual_absoluta > 0 && "text-destructive",
                            company.variacion_mensual_absoluta < 0 && "text-success"
                          )}
                        >
                          {company.variacion_mensual_percent > 0 ? "+" : ""}
                          {company.variacion_mensual_percent.toFixed(1)}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {company.variacion_mensual_absoluta > 0 ? "+" : ""}
                          {formatCurrency(Math.abs(company.variacion_mensual_absoluta))}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Acumulado YTD */}
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
                  {totals.totalEmployeesCurrent}
                </TableCell>
                <TableCell className="text-right">
                  {totals.totalEmployeesPrevious > 0 ? (
                    <div className="flex items-center justify-end gap-2">
                      {totals.empDiff > 0 ? (
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      ) : totals.empDiff < 0 ? (
                        <TrendingDown className="h-4 w-4 text-orange-600" />
                      ) : (
                        <span className="w-4" />
                      )}
                      <span className={cn(
                        "font-bold",
                        totals.empDiff > 0 && "text-blue-600",
                        totals.empDiff < 0 && "text-orange-600"
                      )}>
                        {totals.empDiff > 0 ? "+" : ""}
                        {totals.empDiff}
                      </span>
                    </div>
                  ) : (
                    <span>—</span>
                  )}
                </TableCell>

                {/* Coste Mensual Actual Total */}
                <TableCell className="text-right font-bold">
                  {formatCurrency(totals.totalCosteMensual)}
                </TableCell>

                {/* Coste Mensual Año Anterior Total */}
                <TableCell className="text-right text-muted-foreground font-semibold">
                  {totals.totalCosteMensualAnterior > 0
                    ? formatCurrency(totals.totalCosteMensualAnterior)
                    : "—"}
                </TableCell>

                {/* Variación Mensual Total */}
                <TableCell className="text-right">
                  {totals.totalCosteMensualAnterior > 0 ? (
                    <div className="flex items-center justify-end gap-2">
                      {totals.totalVariacionMensualEuros > 0 ? (
                        <TrendingUp className="h-4 w-4 text-destructive" />
                      ) : totals.totalVariacionMensualEuros < 0 ? (
                        <TrendingDown className="h-4 w-4 text-success" />
                      ) : null}
                      <div className="flex flex-col items-end">
                        <span
                          className={cn(
                            "font-bold",
                            totals.totalVariacionMensualEuros > 0 && "text-destructive",
                            totals.totalVariacionMensualEuros < 0 && "text-success"
                          )}
                        >
                          {totals.totalCosteMensualAnterior > 0
                            ? `${((totals.totalVariacionMensualEuros / totals.totalCosteMensualAnterior) * 100).toFixed(1)}%`
                            : "—"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {totals.totalVariacionMensualEuros > 0 ? "+" : ""}
                          {formatCurrency(Math.abs(totals.totalVariacionMensualEuros))}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Acumulado YTD Total */}
                <TableCell className="text-right font-bold">
                  {formatCurrency(totals.totalCosteAcumuladoYTD)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground font-semibold">
                  {totals.totalCosteAcumuladoAnterior > 0 
                    ? formatCurrency(totals.totalCosteAcumuladoAnterior)
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  {totals.totalCosteAcumuladoAnterior > 0 ? (
                    <div className="flex items-center justify-end gap-2">
                      {totals.totalVariacionEuros > 0 ? (
                        <TrendingUp className="h-4 w-4 text-destructive" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-success" />
                      )}
                      <div className="flex flex-col items-end">
                        <span
                          className={cn(
                            "font-bold",
                            totals.totalVariacionEuros > 0 && "text-destructive",
                            totals.totalVariacionEuros < 0 && "text-success"
                          )}
                        >
                          {totals.totalVariacionPercent > 0 ? "+" : ""}
                          {totals.totalVariacionPercent.toFixed(1)}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {totals.totalVariacionEuros > 0 ? "+" : ""}
                          {formatCurrency(Math.abs(totals.totalVariacionEuros))}
                        </span>
                      </div>
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
