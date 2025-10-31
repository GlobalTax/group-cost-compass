import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEmployees } from "@/hooks/useEmployees";
import { useEmployeeCosts } from "@/hooks/useEmployeeCosts";
import { useCreatePerformanceReview } from "@/hooks/usePerformanceReviews";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { performanceReviewSchema, type PerformanceReviewFormData } from "@/lib/validators/compensationSchema";

interface PerformanceReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId?: string;
}

const PERIODS = [
  { value: "2024-H1", label: "2024 - Primer Semestre" },
  { value: "2024-H2", label: "2024 - Segundo Semestre" },
  { value: "2025-H1", label: "2025 - Primer Semestre" },
  { value: "2025-H2", label: "2025 - Segundo Semestre" },
];

export function PerformanceReviewDialog({ open, onOpenChange, employeeId }: PerformanceReviewDialogProps) {
  const { data: employees } = useEmployees({ activeOnly: true });
  const createReview = useCreatePerformanceReview();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeId || "");
  const { data: costs } = useEmployeeCosts(selectedEmployeeId || undefined);

  const form = useForm<PerformanceReviewFormData>({
    resolver: zodResolver(performanceReviewSchema),
    defaultValues: {
      employee_id: employeeId || "",
      review_period: "",
      reviewer_id: "",
      performance_score: 7,
      bonus_multiplier: 1.0,
      strengths: "",
      areas_improvement: "",
    },
  });

  const performanceScore = form.watch("performance_score");
  const bonusMultiplier = form.watch("bonus_multiplier");

  // Calcular salario base anual
  const annualSalary = costs && costs.length > 0
    ? Number([...costs].sort((a, b) => b.period.localeCompare(a.period))[0].bruto) * 12
    : 0;

  const selectedEmployee = employees?.find((e) => e.id === (form.watch("employee_id") || selectedEmployeeId));

  // Target bonus % por nivel
  const targetBonusPct = (() => {
    const level = selectedEmployee?.compensation_level;
    if (!level) return 0;
    if (level.startsWith("IC")) return 0.05;
    if (level.startsWith("Sr")) return 0.15;
    if (level.startsWith("Mgr") || level === "Head") return 0.20;
    return 0.10;
  })();

  const projectedBonus = annualSalary * targetBonusPct * bonusMultiplier;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const onSubmit = async (data: PerformanceReviewFormData) => {
    // Validar campos requeridos
    if (!data.employee_id || !data.review_period) {
      return;
    }
    
    await createReview.mutateAsync({
      employee_id: data.employee_id,
      review_period: data.review_period,
      reviewer_id: data.reviewer_id,
      performance_score: data.performance_score,
      bonus_multiplier: data.bonus_multiplier || 1.0,
      strengths: data.strengths,
      areas_improvement: data.areas_improvement,
      review_date: data.review_date,
    });
    form.reset();
    onOpenChange(false);
  };

  const handleEmployeeChange = (empId: string) => {
    setSelectedEmployeeId(empId);
    form.setValue("employee_id", empId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Evaluación de Desempeño</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="employee_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empleado</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={handleEmployeeChange}
                      disabled={!!employeeId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona empleado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees?.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.full_name} • {emp.compensation_level || "Sin nivel"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="review_period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona período" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PERIODS.map((period) => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reviewer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evaluador</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona evaluador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees
                        ?.filter((emp) => emp.compensation_level?.includes("Mgr") || emp.compensation_level === "Head")
                        .map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.full_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="performance_score"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Performance Score</FormLabel>
                    <span className="text-2xl font-bold text-primary">{field.value}/10</span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(v) => {
                        field.onChange(v[0]);
                        // Auto-ajustar multiplier basado en score
                        const multiplier = v[0] / 10;
                        form.setValue("bonus_multiplier", Math.round(multiplier * 100) / 100);
                      }}
                      min={0}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bonus_multiplier"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Bonus Multiplier</FormLabel>
                    <span className="text-xl font-semibold">{field.value.toFixed(2)}x</span>
                  </div>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(v) => field.onChange(v[0])}
                      min={0.5}
                      max={1.5}
                      step={0.05}
                      className="w-full"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Rango: 0.5x (bajo) a 1.5x (excepcional)</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview del bonus */}
            {annualSalary > 0 && (
              <Card className="border-primary">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Bonus Proyectado (solo desempeño):</p>
                    <p className="text-3xl font-bold text-primary">{formatCurrency(projectedBonus)}</p>
                    <p className="text-xs text-muted-foreground">
                      Salario base: {formatCurrency(annualSalary)} × Target: {(targetBonusPct * 100).toFixed(0)}% × Multiplier: {bonusMultiplier.toFixed(2)}x
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <FormField
              control={form.control}
              name="strengths"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fortalezas</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe las principales fortalezas del empleado..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="areas_improvement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Áreas de Mejora</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe las áreas en las que el empleado puede mejorar..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createReview.isPending}>
                {createReview.isPending ? "Guardando..." : "Guardar Evaluación"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
