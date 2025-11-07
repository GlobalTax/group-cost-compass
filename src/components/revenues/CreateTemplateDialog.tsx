import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, User, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAllocationTemplateManagement } from "@/hooks/useAllocationTemplates";
import { useEmployees } from "@/hooks/useEmployees";
import { useTeams } from "@/hooks/useTeams";
import { createTemplateWithItemsSchema } from "@/lib/validators/allocationTemplateSchema";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CreateTemplateDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { createTemplate } = useAllocationTemplateManagement();
  const { data: employees } = useEmployees({ activeOnly: true });
  const { data: teams } = useTeams();

  const form = useForm({
    resolver: zodResolver(createTemplateWithItemsSchema),
    defaultValues: {
      template: {
        name: "",
        description: "",
        is_default: false,
      },
      items: [
        {
          employee_id: null,
          team_id: null,
          allocation_percentage: 0,
          allocation_type: null,
          notes: "",
          display_order: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchItems = form.watch("items");
  const totalPercentage = watchItems.reduce(
    (sum, item) => sum + (Number(item.allocation_percentage) || 0),
    0
  );

  const isValidTotal = Math.abs(totalPercentage - 100) < 0.01;

  const onSubmit = async (data: any) => {
    try {
      await createTemplate.mutateAsync({
        templateData: data.template,
        items: data.items,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Template de Asignación</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Info del template */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Template *</Label>
              <Input
                id="name"
                {...form.register("template.name")}
                placeholder="Ej: Distribución Estándar Legal"
              />
              {form.formState.errors.template?.name && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.template.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...form.register("template.description")}
                placeholder="Descripción opcional del template"
                rows={2}
              />
            </div>
          </div>

          {/* Líneas de asignación */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Asignaciones del Template</h3>
              <div className={`text-sm font-medium ${isValidTotal ? "text-emerald-600" : "text-amber-600"}`}>
                Total: {totalPercentage.toFixed(1)}% / 100%
              </div>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Empleado</Label>
                      <Select
                        value={form.watch(`items.${index}.employee_id`) || ""}
                        onValueChange={(value) => {
                          form.setValue(`items.${index}.employee_id`, value);
                          form.setValue(`items.${index}.team_id`, null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar empleado">
                            {form.watch(`items.${index}.employee_id`) && (
                              <span className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                {employees?.find(e => e.id === form.watch(`items.${index}.employee_id`))?.full_name}
                              </span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {employees?.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              <span className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                {emp.full_name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Equipo</Label>
                      <Select
                        value={form.watch(`items.${index}.team_id`) || ""}
                        onValueChange={(value) => {
                          form.setValue(`items.${index}.team_id`, value);
                          form.setValue(`items.${index}.employee_id`, null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar equipo">
                            {form.watch(`items.${index}.team_id`) && (
                              <span className="flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                {teams?.find(t => t.id === form.watch(`items.${index}.team_id`))?.name}
                              </span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {teams?.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              <span className="flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                {team.name}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs">Porcentaje (%)*</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...form.register(`items.${index}.allocation_percentage`, {
                          valueAsNumber: true,
                        })}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Tipo</Label>
                      <Select
                        value={form.watch(`items.${index}.allocation_type`) || ""}
                        onValueChange={(value) =>
                          form.setValue(`items.${index}.allocation_type`, value as any)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="originator">Originador</SelectItem>
                          <SelectItem value="executor">Ejecutor</SelectItem>
                          <SelectItem value="support">Soporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Notas</Label>
                    <Input
                      {...form.register(`items.${index}.notes`)}
                      placeholder="Notas opcionales"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => append({
                employee_id: null,
                team_id: null,
                allocation_percentage: 0,
                allocation_type: null,
                notes: "",
                display_order: fields.length,
              })}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Añadir Línea
            </Button>

            {!isValidTotal && totalPercentage > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  La suma de porcentajes debe ser exactamente 100%. Actual: {totalPercentage.toFixed(1)}%
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Botones finales */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValidTotal || createTemplate.isPending}>
              {createTemplate.isPending ? "Creando..." : "Crear Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
