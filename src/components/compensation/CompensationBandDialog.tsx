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
import { useCreateCompensationBand, useUpdateCompensationBand } from "@/hooks/useCompensationBands";
import {
  compensationBandSchema,
  type CompensationBandFormData,
} from "@/lib/validators/compensationSchema";
import type { Database } from "@/integrations/supabase/types";

type CompensationBand = Database["public"]["Tables"]["compensation_bands"]["Row"];

interface CompensationBandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  band?: CompensationBand | null;
  onClose: () => void;
}

const LEVELS = [
  { value: "analyst", label: "Analyst" },
  { value: "associate", label: "Associate" },
  { value: "senior_associate", label: "Senior Associate" },
  { value: "manager", label: "Manager" },
  { value: "director", label: "Director" },
  { value: "partner", label: "Partner" },
];

export function CompensationBandDialog({
  open,
  onOpenChange,
  band,
  onClose,
}: CompensationBandDialogProps) {
  const createBand = useCreateCompensationBand();
  const updateBand = useUpdateCompensationBand();

  const form = useForm<CompensationBandFormData>({
    resolver: zodResolver(compensationBandSchema),
    defaultValues: band
      ? {
          level: band.level,
          min_salary: Number(band.min_salary),
          max_salary: Number(band.max_salary),
          target_bonus_pct: Number(band.target_bonus_pct),
          max_bonus_pct: Number(band.max_bonus_pct),
          success_fee_base_pct: Number(band.success_fee_base_pct),
          description: band.description || "",
          is_active: band.is_active,
        }
      : {
          level: "",
          min_salary: 0,
          max_salary: 0,
          target_bonus_pct: 0,
          max_bonus_pct: 0,
          success_fee_base_pct: 0,
          description: "",
          is_active: true,
        },
  });

  const onSubmit = (data: CompensationBandFormData) => {
    if (band) {
      updateBand.mutate(
        { id: band.id, updates: data },
        {
          onSuccess: () => {
            onClose();
            form.reset();
          },
        }
      );
    } else {
      createBand.mutate(data as any, {
        onSuccess: () => {
          onClose();
          form.reset();
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {band ? "Editar Banda Salarial" : "Nueva Banda Salarial"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel Profesional</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un nivel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="min_salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario Mínimo (€)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salario Máximo (€)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="target_bonus_pct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bonus Objetivo (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_bonus_pct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bonus Máximo (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="success_fee_base_pct"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Success Fee (%)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createBand.isPending || updateBand.isPending}
              >
                {band ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
