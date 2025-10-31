import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Calculator, Award, Download, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CompensationKPIs } from "@/components/compensation/CompensationKPIs";
import { CompensationBandsTable } from "@/components/compensation/CompensationBandsTable";
import { CompensationBandDialog } from "@/components/compensation/CompensationBandDialog";
import { BonusSimulator } from "@/components/compensation/BonusSimulator";
import { PerformanceReviewDialog } from "@/components/compensation/PerformanceReviewDialog";
import { useEmployees } from "@/hooks/useEmployees";
import { useBonusPayments } from "@/hooks/useBonusPayments";
import { useEmployeeCosts } from "@/hooks/useEmployeeCosts";
import { useDeals } from "@/hooks/useDeals";
import { exportCompensationSummary } from "@/lib/exporters/compensationExporter";
import { toast } from "sonner";

export default function Compensation() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const { data: employees } = useEmployees();
  const { data: bonusPayments } = useBonusPayments({ fiscalYear: currentYear });
  const { data: allCosts } = useEmployeeCosts();
  const { data: deals } = useDeals({ fiscalYear: currentYear });

  const currentYearCosts = allCosts?.filter((cost) => {
    const costYear = new Date(cost.period).getFullYear();
    return costYear === currentYear;
  }) || [];

  const totalFixedSalary = currentYearCosts.reduce(
    (sum, cost) => sum + Number(cost.bruto || 0),
    0
  );

  const totalBonusPaid =
    bonusPayments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

  const variablePercentage =
    totalFixedSalary > 0 ? (totalBonusPaid / totalFixedSalary) * 100 : 0;

  const activeEmployees = employees?.filter((emp) => !emp.termination_date).length || 0;

  const activeDeals = deals?.filter((d) => d.status === "active" || d.status === "pipeline") || [];
  const poolCommitted = activeDeals.reduce((sum, deal) => sum + Number(deal.success_fee_pool || 0), 0);

  const variableThreshold = 15;
  const showVariableAlert = variablePercentage > variableThreshold;

  const handleExportSummary = async () => {
    try {
      await exportCompensationSummary(currentYear);
      toast.success(`Resumen exportado: compensacion_${currentYear}.xlsx`);
    } catch (error: any) {
      toast.error("Error al exportar: " + error.message);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Gestión de Compensación"
          subtitle="Simulador de bonus, bandas salariales y evaluaciones de desempeño"
        />
        <Button onClick={handleExportSummary} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar Resumen {currentYear}
        </Button>
      </div>

      {showVariableAlert && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            El % variable ({variablePercentage.toFixed(1)}%) supera el {variableThreshold}% sobre masa salarial.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <CompensationKPIs
          totalFixedSalary={totalFixedSalary}
          totalBonusPaid={totalBonusPaid}
          variablePercentage={variablePercentage}
          activeEmployees={activeEmployees}
        />
        <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-6">
          <div className="rounded-full bg-info/10 p-3">
            <Calculator className="h-5 w-5 text-info" />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Pool Comprometido</p>
            <p className="text-2xl font-semibold">
              {new Intl.NumberFormat("es-ES", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(poolCommitted)}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="simulator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="simulator">
            <Calculator className="w-4 h-4 mr-2" />
            Simulador de Bonus
          </TabsTrigger>
          <TabsTrigger value="bands">Bandas Salariales</TabsTrigger>
          <TabsTrigger value="reviews">
            <Award className="w-4 h-4 mr-2" />
            Evaluaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="simulator">
          <BonusSimulator />
        </TabsContent>

        <TabsContent value="bands">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Bandas Salariales</CardTitle>
                <CardDescription>Define rangos salariales y bonus por nivel</CardDescription>
              </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Banda
              </Button>
            </CardHeader>
            <CardContent>
              <CompensationBandsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Evaluaciones de Desempeño</CardTitle>
                <CardDescription>Crea evaluaciones desde aquí o desde la ficha de empleado</CardDescription>
              </div>
              <Button onClick={() => setIsReviewDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Evaluación
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Las evaluaciones completas se visualizan en la pestaña "Compensación" del detalle de cada empleado.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CompensationBandDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onClose={() => setIsDialogOpen(false)} />
      <PerformanceReviewDialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen} />
    </div>
  );
}
