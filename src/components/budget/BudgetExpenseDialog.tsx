import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { budgetExpenseSchema, type BudgetExpenseInput } from "@/lib/validators/budgetSchema";
import { useCreateBudgetExpense, useUpdateBudgetExpense } from "@/hooks/useBudgetExpenses";

interface BudgetExpenseDialogProps {
  open: boolean;
  onClose: () => void;
  budgetPeriodId: string;
  editingItem?: any;
}

const categoryOptions = [
  { value: "operational", label: "Operacional" },
  { value: "investment", label: "Inversión" },
  { value: "other", label: "Otro" },
];

export function BudgetExpenseDialog({
  open,
  onClose,
  budgetPeriodId,
  editingItem,
}: BudgetExpenseDialogProps) {
  const createExpense = useCreateBudgetExpense();
  const updateExpense = useUpdateBudgetExpense();

  const form = useForm<BudgetExpenseInput>({
    resolver: zodResolver(budgetExpenseSchema),
    defaultValues: {
      budget_period_id: budgetPeriodId,
      category: "operational",
      subcategory: "",
      description: "",
      budgeted_amount: 0,
      actual_amount: null,
      notes: "",
    },
  });

  useEffect(() => {
    if (editingItem) {
      form.reset({
        budget_period_id: budgetPeriodId,
        category: editingItem.category,
        subcategory: editingItem.subcategory || "",
        description: editingItem.description,
        budgeted_amount: editingItem.budgeted_amount,
        actual_amount: editingItem.actual_amount,
        notes: editingItem.notes || "",
      });
    } else {
      form.reset({
        budget_period_id: budgetPeriodId,
        category: "operational",
        subcategory: "",
        description: "",
        budgeted_amount: 0,
        actual_amount: null,
        notes: "",
      });
    }
  }, [editingItem, budgetPeriodId, form]);

  const onSubmit = (data: BudgetExpenseInput) => {
    const payload = {
      ...data,
      subcategory: data.subcategory || null,
      actual_amount: data.actual_amount || null,
      notes: data.notes || null,
    };

    if (editingItem) {
      updateExpense.mutate(
        { id: editingItem.id, updates: payload },
        { onSuccess: onClose }
      );
    } else {
      createExpense.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Editar Gasto" : "Nuevo Gasto"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
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
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subcategoría (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="budgeted_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importe Presupuestado (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
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
                name="actual_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importe Real (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingItem ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
