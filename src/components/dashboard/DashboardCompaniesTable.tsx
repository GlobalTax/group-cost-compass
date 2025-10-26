import { memo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { ArrowUpRight, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CompanyData {
  id: string;
  name: string;
  bruto: number;
  coste: number;
  employees: number;
  percentOfTotal: number;
}

interface DashboardCompaniesTableProps {
  data: CompanyData[];
}

export const DashboardCompaniesTable = memo(({
  data,
}: DashboardCompaniesTableProps) => {
  const navigate = useNavigate();

  const handleRowClick = useCallback((companyId: string) => {
    navigate(`/companies/${companyId}`);
  }, [navigate]);

  return (
    <Card className="p-6 border border-border backdrop-blur-sm bg-card/50">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Resumen por Empresa
          </h3>
          <p className="text-sm text-muted-foreground">
            Click en una empresa para ver más detalles
          </p>
        </div>
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Empresa</TableHead>
                <TableHead className="text-right font-semibold">Empleados</TableHead>
                <TableHead className="text-right font-semibold">Bruto Total</TableHead>
                <TableHead className="text-right font-semibold">Coste Total</TableHead>
                <TableHead className="text-right font-semibold">% del Total</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay datos disponibles
                  </TableCell>
                </TableRow>
              ) : (
                data.map((company) => {
                  const isHighBudget = company.percentOfTotal > 10;
                  
                  return (
                    <TableRow
                      key={company.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleRowClick(company.id)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {company.name}
                          {isHighBudget && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Badge variant="destructive" className="gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    &gt;10%
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Esta empresa representa más del 10% del presupuesto total
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{company.employees}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(company.bruto)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(company.coste)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="secondary"
                          className={cn(
                            isHighBudget && "bg-destructive/10 text-destructive border-destructive/20"
                          )}
                        >
                          {formatPercentage(company.percentOfTotal)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
});

DashboardCompaniesTable.displayName = "DashboardCompaniesTable";
