import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { costSchema, type CostFormData } from "@/lib/validators/costsSchema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateEmployeeCost, useUpdateEmployeeCost } from "@/hooks/useEmployeeCosts";

interface EditCostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  cost?: {
    id: string;
    period: string;
    bruto: number;
    coste_empresa: number;
  } | null;
}

export const EditCostDialog = ({
  open,
  onOpenChange,
  employeeId,
  cost,
}: EditCostDialogProps) => {
  const createMutation = useCreateEmployeeCost();
  const updateMutation = useUpdateEmployeeCost();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CostFormData>({
    resolver: zodResolver(costSchema),
    defaultValues: {
      employee_id: employeeId,
      period: "",
      bruto: 0,
      coste_empresa: 0,
    },
  });

  // Load existing cost data when editing
  useEffect(() => {
    if (cost) {
      form.reset({
        employee_id: employeeId,
        period: cost.period,
        bruto: cost.bruto,
        coste_empresa: cost.coste_empresa,
      });
    } else {
      form.reset({
        employee_id: employeeId,
        period: "",
        bruto: 0,
        coste_empresa: 0,
      });
    }
  }, [cost, employeeId, form]);

  const onSubmit = async (data: CostFormData) => {
    setIsSubmitting(true);
    try {
      if (cost?.id) {
        // Update existing cost
        await updateMutation.mutateAsync({
          id: cost.id,
          updates: {
            period: data.period,
            bruto: data.bruto,
            coste_empresa: data.coste_empresa,
          },
        });
      } else {
        // Create new cost
        await createMutation.mutateAsync({
          employee_id: data.employee_id,
          period: data.period,
          bruto: data.bruto,
          coste_empresa: data.coste_empresa,
        });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error saving cost:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {cost ? "Editar Coste Mensual" : "Añadir Coste Mensual"}
          </DialogTitle>
          <DialogDescription>
            {cost
              ? "Modifica los datos del coste mensual del empleado"
              : "Registra un nuevo período de coste para el empleado"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Período (YYYY-MM)</FormLabel>
                  <FormControl>
                    <Input
                      type="month"
                      placeholder="2025-01"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bruto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bruto Mensual (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="2500.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coste_empresa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coste Empresa (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="3000.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
