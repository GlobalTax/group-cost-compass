import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Calculator, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompensationKPIs } from "@/components/compensation/CompensationKPIs";
import { CompensationBandsTable } from "@/components/compensation/CompensationBandsTable";
import { CompensationBandDialog } from "@/components/compensation/CompensationBandDialog";
import { BonusSimulator } from "@/components/compensation/BonusSimulator";
import { PerformanceReviewDialog } from "@/components/compensation/PerformanceReviewDialog";
import { useEmployees } from "@/hooks/useEmployees";
import { useBonusPayments } from "@/hooks/useBonusPayments";
import { useEmployeeCosts } from "@/hooks/useEmployeeCosts";

export default function Compensation() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const { data: employees } = useEmployees();
  const { data: bonusPayments } = useBonusPayments({ fiscalYear: currentYear });
  const { data: allCosts } = useEmployeeCosts();

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

  return (
    <div className="flex-1 space-y-6 p-8">
      <PageHeader
        title="Gestión de Compensación"
        subtitle="Simulador de bonus, bandas salariales y evaluaciones de desempeño"
      />

      <CompensationKPIs
        totalFixedSalary={totalFixedSalary}
        totalBonusPaid={totalBonusPaid}
        variablePercentage={variablePercentage}
        activeEmployees={activeEmployees}
      />

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
