import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CompensationKPIs } from "@/components/compensation/CompensationKPIs";
import { CompensationBandsTable } from "@/components/compensation/CompensationBandsTable";
import { CompensationBandDialog } from "@/components/compensation/CompensationBandDialog";
import { useEmployees } from "@/hooks/useEmployees";
import { useBonusPayments } from "@/hooks/useBonusPayments";
import { useEmployeeCosts } from "@/hooks/useEmployeeCosts";

export default function Compensation() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const { data: employees } = useEmployees();
  const { data: bonusPayments } = useBonusPayments({ fiscalYear: currentYear });
  const { data: allCosts } = useEmployeeCosts();

  // Calcular KPIs desde los costes anuales
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
        subtitle="Administra bandas salariales, bonus y compensación variable del equipo"
      />

      <CompensationKPIs
        totalFixedSalary={totalFixedSalary}
        totalBonusPaid={totalBonusPaid}
        variablePercentage={variablePercentage}
        activeEmployees={activeEmployees}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Bandas Salariales</h2>
            <p className="text-sm text-muted-foreground">
              Define los rangos salariales y % de bonus por nivel profesional
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Banda
          </Button>
        </div>

        <CompensationBandsTable />
      </div>

      <CompensationBandDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
