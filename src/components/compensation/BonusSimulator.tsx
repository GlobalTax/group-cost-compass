import { useState, useMemo } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { useEmployeeCosts } from "@/hooks/useEmployeeCosts";
import { useEmployeeDeals } from "@/hooks/useDeals";
import { useLatestPerformanceReview } from "@/hooks/usePerformanceReviews";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, TrendingUp, AlertTriangle, Save } from "lucide-react";
import { toast } from "sonner";
import { useCreateProjectedBonus } from "@/hooks/useCreateProjectedBonus";

export function BonusSimulator() {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [performanceScore, setPerformanceScore] = useState<number>(7);
  const [selectedDealIds, setSelectedDealIds] = useState<Set<string>>(new Set());

  const { data: employees, isLoading: isLoadingEmployees } = useEmployees({ activeOnly: true });
  const { data: costs } = useEmployeeCosts(selectedEmployeeId || undefined);
  const { data: deals } = useEmployeeDeals(selectedEmployeeId || undefined);
  const { data: latestReview } = useLatestPerformanceReview(selectedEmployeeId || undefined);
  
  const createBonus = useCreateProjectedBonus();

  const selectedEmployee = employees?.find((e) => e.id === selectedEmployeeId);

  // Calcular salario base anual
  const annualSalary = useMemo(() => {
    if (!costs || costs.length === 0) return 0;
    const latestCost = [...costs].sort((a, b) => b.period.localeCompare(a.period))[0];
    return Number(latestCost.bruto) * 12;
  }, [costs]);

  // Target bonus % por nivel
  const targetBonusPct = useMemo(() => {
    const level = selectedEmployee?.compensation_level;
    if (!level) return 0;
    if (level.startsWith("IC")) return 0.05; // 5%
    if (level.startsWith("Sr")) return 0.15; // 15%
    if (level.startsWith("Mgr") || level === "Head") return 0.20; // 20%
    return 0.10;
  }, [selectedEmployee]);

  // Bonus multiplier basado en performance score
  const bonusMultiplier = performanceScore / 10;

  // Calcular bonus de desempeño
  const performanceBonus = annualSalary * targetBonusPct * bonusMultiplier;

  // Calcular success fee bonus de deals seleccionados
  const successFeeBonus = useMemo(() => {
    if (!deals) return 0;
    return deals
      .filter((deal) => selectedDealIds.has(deal.id))
      .reduce((sum, deal) => {
        const participation = deal.participants?.find((p) => p.employee_id === selectedEmployeeId);
        return sum + (participation ? Number(participation.bonus_amount) : 0);
      }, 0);
  }, [deals, selectedDealIds, selectedEmployeeId]);

  // Total bonus
  const totalBonus = performanceBonus + successFeeBonus;

  // Warnings
  const isHighBonus = totalBonus > annualSalary * 0.5;
  const isVeryHighBonus = totalBonus > annualSalary;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const handleToggleDeal = (dealId: string) => {
    setSelectedDealIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dealId)) {
        newSet.delete(dealId);
      } else {
        newSet.add(dealId);
      }
      return newSet;
    });
  };

  const handleSaveProjection = async () => {
    if (!selectedEmployeeId) {
      toast.error("Selecciona un empleado");
      return;
    }

    const currentYear = new Date().getFullYear();
    
    await createBonus.mutateAsync({
      employee_id: selectedEmployeeId,
      payment_date: new Date().toISOString().split("T")[0],
      fiscal_year: currentYear,
      amount: totalBonus,
      notes: `Proyección: Performance (${performanceScore}/10) + Success Fees (${selectedDealIds.size} deals)`,
    });
  };

  if (isLoadingEmployees) {
    return <Skeleton className="h-[600px] w-full" />;
  }

  return (
    <div className="space-y-6">
      {/* Selección de empleado */}
      <Card>
        <CardHeader>
          <CardTitle>Simulador de Bonus</CardTitle>
          <CardDescription>Calcula bonus proyectado basado en desempeño y operaciones cerradas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Empleado</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un empleado" />
              </SelectTrigger>
              <SelectContent>
                {employees?.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.full_name} • {emp.compensation_level || "Sin nivel"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEmployeeId && (
            <>
              {/* Performance Score */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Performance Score</Label>
                  <span className="text-2xl font-bold text-primary">{performanceScore}/10</span>
                </div>
                <Slider
                  value={[performanceScore]}
                  onValueChange={(v) => setPerformanceScore(v[0])}
                  min={0}
                  max={10}
                  step={0.5}
                  className="w-full"
                />
                {latestReview && (
                  <p className="text-xs text-muted-foreground">
                    Última evaluación: {Number(latestReview.performance_score)}/10
                  </p>
                )}
              </div>

              {/* Deals seleccionables */}
              {deals && deals.length > 0 && (
                <div className="space-y-3">
                  <Label>Operaciones a Incluir</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                    {deals.map((deal) => {
                      const participation = deal.participants?.find((p) => p.employee_id === selectedEmployeeId);
                      return (
                        <div key={deal.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={deal.id}
                            checked={selectedDealIds.has(deal.id)}
                            onCheckedChange={() => handleToggleDeal(deal.id)}
                          />
                          <label
                            htmlFor={deal.id}
                            className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {deal.deal_name} ({participation?.participation_pct}% •{" "}
                            {formatCurrency(Number(participation?.bonus_amount || 0))})
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Resultado del cálculo */}
      {selectedEmployeeId && annualSalary > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bonus Desempeño</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(performanceBonus)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(targetBonusPct * 100).toFixed(0)}% target × {(bonusMultiplier * 100).toFixed(0)}% multiplicador
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Fees</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(successFeeBonus)}</div>
                <p className="text-xs text-muted-foreground mt-1">{selectedDealIds.size} operaciones</p>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bonus Proyectado</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(totalBonus)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((totalBonus / annualSalary) * 100).toFixed(1)}% del salario base
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Warnings */}
          {(isHighBonus || isVeryHighBonus) && (
            <Alert variant={isVeryHighBonus ? "destructive" : "default"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {isVeryHighBonus
                  ? "⚠️ Bonus superior al 100% del salario base. Requiere aprobación de Dirección."
                  : "⚠️ Bonus superior al 50% del salario base. Revisar con Finanzas."}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSelectedEmployeeId("")}>
              Limpiar
            </Button>
            <Button onClick={handleSaveProjection}>
              <Save className="w-4 h-4 mr-2" />
              Guardar Proyección
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
