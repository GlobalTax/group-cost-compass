import { useParams, useNavigate } from "react-router-dom";
import { useEmployee } from "@/hooks/useEmployees";
import { useEmployeeCosts } from "@/hooks/useEmployeeCosts";
import { useTransfers } from "@/hooks/useTransfers";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Edit, Building2, Calendar, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate, formatPeriod } from "@/lib/formatters";
import { useState } from "react";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";

const EmployeeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: employee, isLoading: isLoadingEmployee } = useEmployee(id!);
  const { data: costs, isLoading: isLoadingCosts } = useEmployeeCosts(id);
  const { data: transfers, isLoading: isLoadingTransfers } = useTransfers(id);

  if (isLoadingEmployee) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto p-6">
          <p className="text-muted-foreground">Empleado no encontrado</p>
        </main>
      </div>
    );
  }

  const isActive = !employee.termination_date;
  
  // Calculate yearly summary from costs
  const yearlySummary = costs?.reduce((acc, cost) => {
    const year = cost.period.substring(0, 4);
    if (!acc[year]) {
      acc[year] = { year, bruto: 0, coste: 0, count: 0 };
    }
    acc[year].bruto += cost.bruto || 0;
    acc[year].coste += cost.coste_empresa || 0;
    acc[year].count += 1;
    return acc;
  }, {} as Record<string, { year: string; bruto: number; coste: number; count: number }>);

  const yearlySummaryArray = Object.values(yearlySummary || {}).sort((a, b) => b.year.localeCompare(a.year));

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/employees")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Empleados
        </Button>

        {/* Header */}
        <Card className="glass-card p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {employee.full_name}
                </h1>
                <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-success" : ""}>
                  {isActive ? "Activo" : "Inactivo"}
                </Badge>
                {employee.transfer_group && (
                  <Badge variant="outline" className="border-primary text-primary">
                    Traslado
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {employee.dni && (
                  <span className="flex items-center gap-1">
                    {employee.dni}
                  </span>
                )}
                {employee.companies && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {employee.companies.name}
                  </span>
                )}
                {employee.hire_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Alta: {formatDate(employee.hire_date)}
                  </span>
                )}
              </div>
            </div>

            <Button onClick={() => setEditDialogOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="costs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="costs">Costes Mensuales</TabsTrigger>
            <TabsTrigger value="yearly">Resumen Anual</TabsTrigger>
            <TabsTrigger value="transfers">Traslados</TabsTrigger>
          </TabsList>

          {/* Costs Tab */}
          <TabsContent value="costs">
            <Card className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4">Costes Mensuales</h3>
              
              {isLoadingCosts ? (
                <Skeleton className="h-64 w-full" />
              ) : costs && costs.length > 0 ? (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Período</TableHead>
                        <TableHead className="font-semibold text-right">Bruto Mensual</TableHead>
                        <TableHead className="font-semibold text-right">Coste Empresa</TableHead>
                        <TableHead className="font-semibold text-right">Ratio</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {costs.map((cost) => {
                        const ratio = cost.bruto ? (cost.coste_empresa || 0) / cost.bruto : 0;
                        return (
                          <TableRow key={cost.id}>
                            <TableCell className="font-medium">
                              {formatPeriod(cost.period)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(cost.bruto || 0)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(cost.coste_empresa || 0)}
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                              {ratio.toFixed(2)}x
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay costes registrados para este empleado
                </p>
              )}
            </Card>
          </TabsContent>

          {/* Yearly Summary Tab */}
          <TabsContent value="yearly">
            <Card className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4">Resumen Anual</h3>
              
              {yearlySummaryArray.length > 0 ? (
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Año</TableHead>
                        <TableHead className="font-semibold text-right">Bruto Anual</TableHead>
                        <TableHead className="font-semibold text-right">Coste Anual</TableHead>
                        <TableHead className="font-semibold text-center">Meses</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {yearlySummaryArray.map((summary) => (
                        <TableRow key={summary.year}>
                          <TableCell className="font-bold">{summary.year}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(summary.bruto)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(summary.coste)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{summary.count} meses</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay datos anuales disponibles
                </p>
              )}
            </Card>
          </TabsContent>

          {/* Transfers Tab */}
          <TabsContent value="transfers">
            <Card className="glass-card p-6">
              <h3 className="font-bold text-lg mb-4">Historial de Traslados</h3>
              
              {isLoadingTransfers ? (
                <Skeleton className="h-64 w-full" />
              ) : transfers && transfers.length > 0 ? (
                <div className="space-y-4">
                  {transfers.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-sm">
                            <span className="font-medium">{transfer.from_company?.name}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-primary" />
                          <div className="text-sm">
                            <span className="font-medium">{transfer.to_company?.name}</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(transfer.transfer_date)}
                        </div>
                      </div>
                      {transfer.reason && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {transfer.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay traslados registrados para este empleado
                </p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <EmployeeDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        employee={employee}
      />
    </div>
  );
};

export default EmployeeDetail;
