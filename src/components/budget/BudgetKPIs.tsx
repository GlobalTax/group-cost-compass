import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface BudgetKPIsProps {
  budgetedIncome: number;
  actualIncome: number;
  budgetedExpenses: number;
  actualExpenses: number;
  budgetedResult: number;
  actualResult: number;
}

export function BudgetKPIs({
  budgetedIncome,
  actualIncome,
  budgetedExpenses,
  actualExpenses,
  budgetedResult,
  actualResult,
}: BudgetKPIsProps) {
  const incomeVariance = actualIncome - budgetedIncome;
  const expensesVariance = actualExpenses - budgetedExpenses;
  const resultVariance = actualResult - budgetedResult;
  
  const calculateVariancePercent = (actual: number, budgeted: number) => {
    if (budgeted === 0) return 0;
    return ((actual - budgeted) / Math.abs(budgeted)) * 100;
  };

  const incomeVariancePercent = calculateVariancePercent(actualIncome, budgetedIncome);
  const expensesVariancePercent = calculateVariancePercent(actualExpenses, budgetedExpenses);
  const resultVariancePercent = calculateVariancePercent(actualResult, budgetedResult);

  const renderTrend = (variance: number, isExpense: boolean = false) => {
    if (variance === 0) return <Minus className="w-4 h-4 text-muted-foreground" />;
    
    const isPositive = isExpense ? variance < 0 : variance > 0;
    
    return isPositive ? (
      <TrendingUp className="w-4 h-4 text-success" />
    ) : (
      <TrendingDown className="w-4 h-4 text-destructive" />
    );
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ingresos</p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Presupuestado</p>
              <p className="text-lg font-semibold">{formatCurrency(budgetedIncome)}</p>
              <p className="text-xs text-muted-foreground mt-2">Real</p>
              <p className="text-lg font-semibold">{formatCurrency(actualIncome)}</p>
            </div>
          </div>
          {renderTrend(incomeVariance)}
        </div>
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">Desviación</p>
          <p className={`text-sm font-medium ${incomeVariance >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(incomeVariance)} ({formatPercent(incomeVariancePercent)})
          </p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Gastos</p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Presupuestado</p>
              <p className="text-lg font-semibold">{formatCurrency(budgetedExpenses)}</p>
              <p className="text-xs text-muted-foreground mt-2">Real</p>
              <p className="text-lg font-semibold">{formatCurrency(actualExpenses)}</p>
            </div>
          </div>
          {renderTrend(expensesVariance, true)}
        </div>
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">Desviación</p>
          <p className={`text-sm font-medium ${expensesVariance <= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(expensesVariance)} ({formatPercent(expensesVariancePercent)})
          </p>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Resultado</p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Presupuestado</p>
              <p className="text-lg font-semibold">{formatCurrency(budgetedResult)}</p>
              <p className="text-xs text-muted-foreground mt-2">Real</p>
              <p className="text-lg font-semibold">{formatCurrency(actualResult)}</p>
            </div>
          </div>
          {renderTrend(resultVariance)}
        </div>
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">Desviación</p>
          <p className={`text-sm font-medium ${resultVariance >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(resultVariance)} ({formatPercent(resultVariancePercent)})
          </p>
        </div>
      </Card>
    </div>
  );
}
