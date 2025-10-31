import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployeeDeals } from "@/hooks/useDeals";
import { useBonusPayments } from "@/hooks/useBonusPayments";
import { usePerformanceReviews } from "@/hooks/usePerformanceReviews";
import { useCompensationBands } from "@/hooks/useCompensationBands";
import { AlertCircle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Database } from "@/integrations/supabase/types";

type Employee = Database["public"]["Tables"]["hr_employees"]["Row"] & {
  companies?: { name: string } | null;
};

interface CompensationTabProps {
  employee: Employee;
  annualSalary: number;
}

const BONUS_TYPE_LABELS: Record<string, string> = {
  performance: "Desempeño",
  success_fee: "Success Fee",
  deal_closing: "Cierre Deal",
  extraordinary: "Extraordinario",
  projected: "Proyectado",
};

export function CompensationTab({ employee, annualSalary }: CompensationTabProps) {
  const { data: deals, isLoading: isLoadingDeals } = useEmployeeDeals(employee.id);
  const { data: bonusPayments, isLoading: isLoadingBonus } = useBonusPayments({ employeeId: employee.id });
  const { data: reviews, isLoading: isLoadingReviews } = usePerformanceReviews(employee.id);
  const { data: bands } = useCompensationBands();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  // Encontrar banda salarial recomendada
  const recommendedBand = bands?.find((band) => band.level === employee.compensation_level);

  // Determinar posición en banda
  const getSalaryPosition = () => {
    if (!recommendedBand || !annualSalary) return null;
    const min = Number(recommendedBand.min_salary);
    const max = Number(recommendedBand.max_salary);

    if (annualSalary < min) return { status: "below", color: "text-destructive", icon: TrendingDown, label: "Por debajo de banda" };
    if (annualSalary === min) return { status: "at-min", color: "text-yellow-600", icon: AlertCircle, label: "Mínimo de banda" };
    if (annualSalary > min && annualSalary < max) return { status: "in-range", color: "text-success", icon: CheckCircle2, label: "Dentro de banda" };
    if (annualSalary === max) return { status: "at-max", color: "text-blue-600", icon: CheckCircle2, label: "Máximo de banda" };
    return { status: "above", color: "text-purple-600", icon: TrendingUp, label: "Por encima de banda" };
  };

  const salaryPosition = getSalaryPosition();

  // Calcular totales de bonus por año
  const currentYear = new Date().getFullYear();
  const bonusByYear = bonusPayments?.reduce((acc, payment) => {
    const year = payment.fiscal_year;
    if (!acc[year]) acc[year] = 0;
    acc[year] += Number(payment.amount);
    return acc;
  }, {} as Record<number, number>);

  const activeDeals = deals?.filter((d) => d.status === "active" || d.status === "pipeline");

  return (
    <div className="space-y-6">
      {/* Banda Salarial */}
      <Card>
        <CardHeader>
          <CardTitle>Banda Salarial</CardTitle>
        </CardHeader>
        <CardContent>
          {recommendedBand ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nivel: {employee.compensation_level}</p>
                  <p className="text-2xl font-bold">{formatCurrency(annualSalary)}</p>
                </div>
                {salaryPosition && (
                  <Badge variant="outline" className={salaryPosition.color}>
                    <salaryPosition.icon className="w-4 h-4 mr-1" />
                    {salaryPosition.label}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mínimo:</span>
                  <span className="font-medium">{formatCurrency(Number(recommendedBand.min_salary))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Máximo:</span>
                  <span className="font-medium">{formatCurrency(Number(recommendedBand.max_salary))}</span>
                </div>
              </div>

              {/* Visual de posición */}
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-primary rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      ((annualSalary - Number(recommendedBand.min_salary)) /
                        (Number(recommendedBand.max_salary) - Number(recommendedBand.min_salary))) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No hay banda salarial definida para este nivel</p>
          )}
        </CardContent>
      </Card>

      {/* Deals Activos */}
      <Card>
        <CardHeader>
          <CardTitle>Operaciones Activas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingDeals ? (
            <Skeleton className="h-24 w-full" />
          ) : activeDeals && activeDeals.length > 0 ? (
            <div className="space-y-3">
              {activeDeals.map((deal) => {
                const participation = deal.participants?.find((p) => p.employee_id === employee.id);
                return (
                  <div key={deal.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{deal.deal_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {participation?.role_in_deal} • {Number(participation?.participation_pct)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(Number(participation?.bonus_amount || 0))}</p>
                      <Badge variant="outline">{deal.status}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No hay operaciones activas</p>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Bonus */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Bonus</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingBonus ? (
            <Skeleton className="h-48 w-full" />
          ) : bonusPayments && bonusPayments.length > 0 ? (
            <>
              <div className="mb-4 grid gap-2 md:grid-cols-3">
                {Object.entries(bonusByYear || {}).map(([year, total]) => (
                  <div key={year} className="rounded-lg border p-3">
                    <p className="text-sm text-muted-foreground">Año {year}</p>
                    <p className="text-xl font-bold">{formatCurrency(total)}</p>
                  </div>
                ))}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonusPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{format(new Date(payment.payment_date), "dd MMM yyyy", { locale: es })}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{BONUS_TYPE_LABELS[payment.bonus_type] || payment.bonus_type}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(Number(payment.amount))}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{payment.notes || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No hay bonus registrados</p>
          )}
        </CardContent>
      </Card>

      {/* Evaluaciones de Desempeño */}
      <Card>
        <CardHeader>
          <CardTitle>Evaluaciones de Desempeño</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingReviews ? (
            <Skeleton className="h-48 w-full" />
          ) : reviews && reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{review.review_period}</p>
                      <p className="text-sm text-muted-foreground">Evaluado por: {review.reviewer?.full_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{Number(review.performance_score)}/10</p>
                      <p className="text-sm text-muted-foreground">Multiplier: {Number(review.bonus_multiplier)}x</p>
                    </div>
                  </div>
                  {review.strengths && (
                    <div className="mb-2">
                      <p className="text-sm font-medium">Fortalezas:</p>
                      <p className="text-sm text-muted-foreground">{review.strengths}</p>
                    </div>
                  )}
                  {review.areas_improvement && (
                    <div>
                      <p className="text-sm font-medium">Áreas de mejora:</p>
                      <p className="text-sm text-muted-foreground">{review.areas_improvement}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No hay evaluaciones registradas</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
