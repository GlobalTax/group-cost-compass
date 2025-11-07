import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  TrendingUp, 
  DollarSign,
  UserPlus,
  UserMinus 
} from "lucide-react";
import { useMonthlyMovements } from "@/hooks/useMonthlyMovements";
import { useCostsEvolution } from "@/hooks/useCostsEvolution";
import { useMonthlyRevenueMatrix } from "@/hooks/useMonthlyRevenueMatrix";
import { CostsChart } from "@/components/costs/CostsChart";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface MonthlyDetailTabsProps {
  selectedMonth: string;
  companyId?: string;
}

export const MonthlyDetailTabs = ({ selectedMonth, companyId }: MonthlyDetailTabsProps) => {
  const [year, month] = selectedMonth.split("-").map(Number);

  // Hooks para datos
  const { data: movements, isLoading: movementsLoading } = useMonthlyMovements({
    month: selectedMonth,
    companyId,
  });

  const { data: costsEvolution, isLoading: costsLoading } = useCostsEvolution({
    month: selectedMonth,
    companyId,
  });

  const { data: revenuesData, isLoading: revenuesLoading } = useMonthlyRevenueMatrix({
    year,
    companyId,
    viewMode: "company",
    startMonth: month,
    endMonth: month,
  });

  return (
    <Card className="border-border">
      <Tabs defaultValue="movements" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
          <TabsTrigger
            value="movements"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <Users className="h-4 w-4 mr-2" />
            Movimientos de Personal
          </TabsTrigger>
          <TabsTrigger
            value="costs"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Evolución de Costes
          </TabsTrigger>
          <TabsTrigger
            value="revenues"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Detalle de Ingresos
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Movimientos de Personal */}
        <TabsContent value="movements" className="p-6">
          {movementsLoading ? (
            <Skeleton className="h-96" />
          ) : (
            <MovementsTab data={movements} />
          )}
        </TabsContent>

        {/* TAB 2: Evolución de Costes */}
        <TabsContent value="costs" className="p-6">
          {costsLoading ? (
            <Skeleton className="h-96" />
          ) : costsEvolution && costsEvolution.length > 0 ? (
            <CostsChart data={costsEvolution} />
          ) : (
            <div className="text-center text-muted-foreground py-12">
              No hay datos de costes disponibles
            </div>
          )}
        </TabsContent>

        {/* TAB 3: Ingresos por Empresa */}
        <TabsContent value="revenues" className="p-6">
          {revenuesLoading ? (
            <Skeleton className="h-96" />
          ) : (
            <RevenuesTab data={revenuesData} selectedMonth={selectedMonth} />
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

// ===== SUBCOMPONENTE: Tab de Movimientos =====
const MovementsTab = ({ data }: { data: any }) => {
  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-12">
        No hay datos de movimientos disponibles
      </div>
    );
  }

  const { hires, terminations, netChange } = data;

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-border">
          <div className="flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Altas</p>
              <p className="text-2xl font-bold">{hires.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-center gap-3">
            <UserMinus className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Bajas</p>
              <p className="text-2xl font-bold">{terminations.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-border">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Cambio Neto</p>
              <p className={`text-2xl font-bold ${netChange > 0 ? "text-green-600" : netChange < 0 ? "text-red-600" : ""}`}>
                {netChange > 0 ? "+" : ""}{netChange}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla de Altas */}
      {hires.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-green-600" />
            Altas del Mes
          </h3>
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Puesto</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Fecha de Alta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hires.map((hire: any) => (
                  <TableRow key={hire.id}>
                    <TableCell className="font-medium">{hire.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{hire.dni}</TableCell>
                    <TableCell>{hire.company_name}</TableCell>
                    <TableCell>{hire.position || "-"}</TableCell>
                    <TableCell>{hire.department || "-"}</TableCell>
                    <TableCell>
                      {format(new Date(hire.movement_date), "dd MMM yyyy", { locale: es })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Tabla de Bajas */}
      {terminations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-red-600" />
            Bajas del Mes
          </h3>
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>DNI</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Puesto</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Fecha de Baja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {terminations.map((term: any) => (
                  <TableRow key={term.id}>
                    <TableCell className="font-medium">{term.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{term.dni}</TableCell>
                    <TableCell>{term.company_name}</TableCell>
                    <TableCell>{term.position || "-"}</TableCell>
                    <TableCell>
                      {term.termination_reason ? (
                        <Badge variant="outline">{term.termination_reason}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(term.movement_date), "dd MMM yyyy", { locale: es })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {hires.length === 0 && terminations.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No hubo movimientos de personal en este mes</p>
        </div>
      )}
    </div>
  );
};

// ===== SUBCOMPONENTE: Tab de Ingresos =====
const RevenuesTab = ({ data, selectedMonth }: { data: any; selectedMonth: string }) => {
  if (!data || !data.rows || data.rows.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No hay ingresos registrados para este mes</p>
      </div>
    );
  }

  const { rows, monthlyTotals } = data;
  const monthKey = selectedMonth; // "2025-03"
  const totalForMonth = monthlyTotals[monthKey] || 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Ingresos por Empresa - {format(new Date(selectedMonth + "-01"), "MMMM yyyy", { locale: es })}
      </h3>

      <div className="border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead className="text-right">Ingresos del Mes</TableHead>
              <TableHead className="text-right">% del Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row: any) => {
              const monthAmount = row.months[monthKey]?.amount || 0;
              const percentage = totalForMonth > 0 
                ? (monthAmount / totalForMonth) * 100 
                : 0;

              return (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(monthAmount)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Total */}
      <Card className="p-4 bg-muted/50 border-border">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium">Total Ingresos del Mes</p>
          <p className="text-2xl font-bold">
            {formatCurrency(totalForMonth)}
          </p>
        </div>
      </Card>
    </div>
  );
};
