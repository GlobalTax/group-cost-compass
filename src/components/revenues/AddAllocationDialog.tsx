import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEmployees } from "@/hooks/useEmployees";
import { useTeams } from "@/hooks/useTeams";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";

const formSchema = z.object({
  assigneeType: z.enum(["employee", "team"]),
  employeeId: z.string().optional(),
  teamId: z.string().optional(),
  allocationMethod: z.enum(["amount", "percentage"]),
  allocatedAmount: z.string().optional(),
  allocationPercentage: z.string().optional(),
  allocationType: z.enum(["originator", "executor", "support"]),
  notes: z.string().optional(),
}).refine(
  (data) => {
    if (data.assigneeType === "employee") {
      return !!data.employeeId;
    } else {
      return !!data.teamId;
    }
  },
  {
    message: "Debe seleccionar un empleado o equipo",
    path: ["employeeId"],
  }
).refine(
  (data) => {
    if (data.allocationMethod === "amount") {
      return !!data.allocatedAmount && Number(data.allocatedAmount) > 0;
    } else {
      return !!data.allocationPercentage && Number(data.allocationPercentage) > 0;
    }
  },
  {
    message: "Debe especificar un valor válido",
    path: ["allocatedAmount"],
  }
);

interface AddAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revenueItemId: string;
  totalAmount: number;
  currentAllocations: {
    totalAmount: number;
    totalPercentage: number;
  };
}

export const AddAllocationDialog = ({
  open,
  onOpenChange,
  revenueItemId,
  totalAmount,
  currentAllocations,
}: AddAllocationDialogProps) => {
  const { data: employees } = useEmployees({ activeOnly: true });
  const { data: teams } = useTeams();
  const { addAllocation } = useRevenueManagement();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assigneeType: "employee",
      allocationMethod: "percentage",
      allocationType: "executor",
      notes: "",
    },
  });

  const assigneeType = form.watch("assigneeType");
  const allocationMethod = form.watch("allocationMethod");
  const allocatedAmount = form.watch("allocatedAmount");
  const allocationPercentage = form.watch("allocationPercentage");

  const remainingAmount = totalAmount - currentAllocations.totalAmount;
  const remainingPercentage = 100 - currentAllocations.totalPercentage;

  const calculatedPreview = useMemo(() => {
    if (allocationMethod === "percentage" && allocationPercentage) {
      const pct = Number(allocationPercentage);
      return {
        type: "percentage",
        amount: (totalAmount * pct) / 100,
      };
    }
    if (allocationMethod === "amount" && allocatedAmount) {
      const amt = Number(allocatedAmount);
      return {
        type: "amount",
        percentage: (amt / totalAmount) * 100,
      };
    }
    return null;
  }, [allocationMethod, allocatedAmount, allocationPercentage, totalAmount]);

  const hasValidationError = useMemo(() => {
    if (allocationMethod === "percentage" && allocationPercentage) {
      return Number(allocationPercentage) > remainingPercentage;
    }
    if (allocationMethod === "amount" && allocatedAmount) {
      return Number(allocatedAmount) > remainingAmount;
    }
    return false;
  }, [allocationMethod, allocatedAmount, allocationPercentage, remainingAmount, remainingPercentage]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (hasValidationError) {
      return;
    }

    const data: any = {
      revenue_item_id: revenueItemId,
      employee_id: values.assigneeType === "employee" ? values.employeeId : null,
      team_id: values.assigneeType === "team" ? values.teamId : null,
      allocation_type: values.allocationType,
      notes: values.notes || null,
    };

    if (values.allocationMethod === "amount") {
      data.allocated_amount = Number(values.allocatedAmount);
      data.allocation_percentage = null;
    } else {
      data.allocation_percentage = Number(values.allocationPercentage);
      data.allocated_amount = null;
    }

    await addAllocation.mutateAsync(data);
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir Asignación</DialogTitle>
          <DialogDescription>
            Asigna parte de este ingreso a un empleado o equipo
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Assignee Type */}
            <FormField
              control={form.control}
              name="assigneeType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Asignar a</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="employee" id="employee" />
                        <Label htmlFor="employee" className="cursor-pointer">
                          Empleado
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="team" id="team" />
                        <Label htmlFor="team" className="cursor-pointer">
                          Equipo
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Employee or Team Selector */}
            {assigneeType === "employee" ? (
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empleado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona empleado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees?.map((emp) => (
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
            ) : (
              <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona equipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams?.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Allocation Method */}
            <FormField
              control={form.control}
              name="allocationMethod"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Método de Asignación</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="percentage" id="percentage" />
                        <Label htmlFor="percentage" className="cursor-pointer">
                          Porcentaje (%)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="amount" id="amount" />
                        <Label htmlFor="amount" className="cursor-pointer">
                          Monto Fijo (€)
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount or Percentage Input */}
            {allocationMethod === "percentage" ? (
              <FormField
                control={form.control}
                name="allocationPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Porcentaje</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        placeholder="0.0"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Disponible: {remainingPercentage.toFixed(1)}%
                    </p>
                    {hasValidationError && (
                      <p className="text-xs text-destructive">
                        Excede el porcentaje disponible
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="allocatedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Fijo</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Disponible: {remainingAmount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
                    </p>
                    {hasValidationError && (
                      <p className="text-xs text-destructive">
                        Excede el monto disponible
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Calculated Preview */}
            {calculatedPreview && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium mb-1">
                  {calculatedPreview.type === "percentage" ? "Monto Calculado" : "Porcentaje Equivalente"}
                </p>
                <p className="text-2xl font-bold">
                  {calculatedPreview.type === "percentage"
                    ? calculatedPreview.amount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
                    : `${calculatedPreview.percentage.toFixed(2)}%`}
                </p>
              </div>
            )}

            {/* Allocation Type */}
            <FormField
              control={form.control}
              name="allocationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Rol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="originator">Originador</SelectItem>
                      <SelectItem value="executor">Ejecutor</SelectItem>
                      <SelectItem value="support">Soporte</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notas adicionales sobre esta asignación"
                      rows={3}
                      {...field}
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
                onClick={() => {
                  onOpenChange(false);
                  form.reset();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={hasValidationError || addAllocation.isPending}
              >
                {addAllocation.isPending ? "Guardando..." : "Guardar Asignación"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
