import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useBudgetPeriod, useUpdateBudgetPeriod, useDeleteBudgetPeriod } from "@/hooks/useBudgetPeriods";
import { useBudgetIncome } from "@/hooks/useBudgetIncome";
import { useBudgetExpenses } from "@/hooks/useBudgetExpenses";
import { BudgetPeriodHeader } from "@/components/budget/BudgetPeriodHeader";
import { BudgetIncomeTable } from "@/components/budget/BudgetIncomeTable";
import { BudgetExpensesTable } from "@/components/budget/BudgetExpensesTable";
import { BudgetPersonnelCostsTable } from "@/components/budget/BudgetPersonnelCostsTable";
import { BudgetTrendChart } from "@/components/budget/BudgetTrendChart";
import { BudgetCompositionChart } from "@/components/budget/BudgetCompositionChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatMonth, getCategoryLabel, getCategoryColor } from "@/lib/formatters";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BudgetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: period, isLoading } = useBudgetPeriod(id);
  const { data: incomeList = [] } = useBudgetIncome(id);
  const { data: expensesList = [] } = useBudgetExpenses(id);
  
  const updatePeriod = useUpdateBudgetPeriod();
  const deletePeriod = useDeleteBudgetPeriod();

  if (isLoading) {
    return <div className="p-6 text-center text-muted-foreground">Cargando...</div>;
  }

  if (!period) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Presupuesto no encontrado</p>
        <Button variant="outline" onClick={() => navigate("/budget")} className="mt-4">
          Volver a Presupuestos
        </Button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: string) => {
    if (!id) return;
    updatePeriod.mutate({ id, updates: { status: newStatus } });
  };

  const handleDelete = () => {
    if (!id) return;
    deletePeriod.mutate(id, {
      onSuccess: () => navigate("/budget"),
    });
  };

  // Calcular totales
  const totalBudgetedIncome = incomeList.reduce((sum, item) => sum + (item.budgeted_amount || 0), 0);
  const totalActualIncome = incomeList.reduce((sum, item) => sum + (item.actual_amount || 0), 0);
  const totalBudgetedExpenses = expensesList.reduce((sum, item) => sum + (item.budgeted_amount || 0), 0);
  const totalActualExpenses = expensesList.reduce((sum, item) => sum + (item.actual_amount || 0), 0);

  // Datos para gráficos
  const incomeTrendData = useMemo(() => {
    if (!incomeList || incomeList.length === 0) return [];
    
    return incomeList.map(item => ({
      period: formatMonth(item.period),
      budgeted: item.budgeted_amount || 0,
      actual: item.actual_amount || 0,
    }));
  }, [incomeList]);

  const expensesTrendData = useMemo(() => {
    if (!expensesList || expensesList.length === 0) return [];
    
    return expensesList.map(item => ({
      period: formatMonth(item.period),
      budgeted: item.budgeted_amount || 0,
      actual: item.actual_amount || 0,
    }));
  }, [expensesList]);

  const incomeComposition = useMemo(() => {
    if (!incomeList || incomeList.length === 0) return [];
    
    const grouped = incomeList.reduce((acc, item) => {
      const cat = item.category || 'other';
      acc[cat] = (acc[cat] || 0) + (item.budgeted_amount || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([category, amount]): { category: string; amount: number; color: string } => ({
      category: getCategoryLabel(category, 'income'),
      amount: amount as number,
      color: getCategoryColor(category, 'income'),
    }));
  }, [incomeList]);

  const expensesComposition = useMemo(() => {
    if (!expensesList || expensesList.length === 0) return [];
    
    const grouped = expensesList.reduce((acc, item) => {
      const cat = item.category || 'other';
      acc[cat] = (acc[cat] || 0) + (item.budgeted_amount || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([category, amount]): { category: string; amount: number; color: string } => ({
      category: getCategoryLabel(category, 'expense'),
      amount: amount as number,
      color: getCategoryColor(category, 'expense'),
    }));
  }, [expensesList]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/budget")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Detalle de Presupuesto</h1>
            <p className="text-sm text-muted-foreground">
              {period.companies?.name || "Consolidado"} - {new Date(period.period).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={period.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Borrador</SelectItem>
              <SelectItem value="approved">Aprobado</SelectItem>
              <SelectItem value="closed">Cerrado</SelectItem>
            </SelectContent>
          </Select>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar presupuesto?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente el presupuesto y todos sus ingresos y gastos asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <BudgetPeriodHeader period={period} />

      {/* Resumen rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Ingresos Presup.</p>
          <p className="text-xl font-semibold">{formatCurrency(totalBudgetedIncome)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Ingresos Real</p>
          <p className="text-xl font-semibold">{formatCurrency(totalActualIncome)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Gastos Presup.</p>
          <p className="text-xl font-semibold">{formatCurrency(totalBudgetedExpenses)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Gastos Real</p>
          <p className="text-xl font-semibold">{formatCurrency(totalActualExpenses)}</p>
        </Card>
      </div>

      <Tabs defaultValue="income" className="w-full">
        <TabsList>
          <TabsTrigger value="income">Ingresos ({incomeList.length})</TabsTrigger>
          <TabsTrigger value="expenses">Otros Gastos ({expensesList.length})</TabsTrigger>
          <TabsTrigger value="personnel">Costes de Personal</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="space-y-4">
          <BudgetIncomeTable budgetPeriodId={id!} data={incomeList} />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <BudgetExpensesTable budgetPeriodId={id!} data={expensesList} />
        </TabsContent>

        <TabsContent value="personnel" className="space-y-4">
          <BudgetPersonnelCostsTable 
            period={period.period} 
            companyId={period.company_id} 
          />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetTrendChart 
              data={incomeTrendData} 
              title="Evolución de Ingresos" 
              type="income" 
            />
            <BudgetTrendChart 
              data={expensesTrendData} 
              title="Evolución de Gastos" 
              type="expenses" 
            />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetCompositionChart 
              data={incomeComposition} 
              title="Composición de Ingresos" 
              total={totalBudgetedIncome}
            />
            <BudgetCompositionChart 
              data={expensesComposition} 
              title="Composición de Gastos" 
              total={totalBudgetedExpenses}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
