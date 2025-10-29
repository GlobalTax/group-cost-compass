import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BudgetKPIs } from "@/components/budget/BudgetKPIs";
import { BudgetSummaryTable } from "@/components/budget/BudgetSummaryTable";
import { useBudgetSummary } from "@/hooks/useBudgetSummary";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCompanies } from "@/hooks/useCompanies";

export default function Budget() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  
  const [year, setYear] = useState(currentYear);
  const [companyId, setCompanyId] = useState<string>("all");

  const { data: summaryData, isLoading } = useBudgetSummary({ 
    year, 
    companyId: companyId === "all" ? undefined : companyId 
  });
  
  const { data: companies } = useCompanies();

  const totals = summaryData?.reduce(
    (acc, row) => ({
      budgetedIncome: acc.budgetedIncome + (row.budgeted_income || 0),
      actualIncome: acc.actualIncome + (row.actual_income || 0),
      budgetedExpenses: acc.budgetedExpenses + (row.total_budgeted_expenses || 0),
      actualExpenses: acc.actualExpenses + (row.total_actual_expenses || 0),
      budgetedResult: acc.budgetedResult + (row.budgeted_result || 0),
      actualResult: acc.actualResult + (row.actual_result || 0),
    }),
    {
      budgetedIncome: 0,
      actualIncome: 0,
      budgetedExpenses: 0,
      actualExpenses: 0,
      budgetedResult: 0,
      actualResult: 0,
    }
  ) || {
    budgetedIncome: 0,
    actualIncome: 0,
    budgetedExpenses: 0,
    actualExpenses: 0,
    budgetedResult: 0,
    actualResult: 0,
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Presupuestos"
        subtitle="Gestión de presupuestos mensuales e ingresos/gastos"
        action={
          <Button onClick={() => navigate('/budget/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Presupuesto
          </Button>
        }
      />

      <div className="flex gap-4">
        <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={companyId} onValueChange={setCompanyId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Empresa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las empresas</SelectItem>
            {companies?.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando...</div>
      ) : (
        <>
          <BudgetKPIs
            budgetedIncome={totals.budgetedIncome}
            actualIncome={totals.actualIncome}
            budgetedExpenses={totals.budgetedExpenses}
            actualExpenses={totals.actualExpenses}
            budgetedResult={totals.budgetedResult}
            actualResult={totals.actualResult}
          />

          <BudgetSummaryTable data={summaryData || []} />
        </>
      )}
    </div>
  );
}
