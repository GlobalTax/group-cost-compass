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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Sparkles, Trash2, X } from "lucide-react";
import { SearchableAssigneeSelector } from "./SearchableAssigneeSelector";
import { useCompanies } from "@/hooks/useCompanies";
import { useRevenues } from "@/hooks/useRevenues";
import { useAllocationTemplates } from "@/hooks/useAllocationTemplates";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const formSchema = z.object({
  companyId: z.string().min(1, "Selecciona una empresa"),
  assignmentMode: z.enum(["template", "custom"]),
  templateId: z.string().optional(),
});

interface CustomAllocation {
  id: string;
  assignee: { type: "employee" | "team"; id: string; name: string };
  percentage: number;
  allocationType: "originator" | "executor" | "support";
}

interface BulkAssignByCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedCompanyId?: string;
}

export const BulkAssignByCompanyDialog = ({
  open,
  onOpenChange,
  preSelectedCompanyId,
}: BulkAssignByCompanyDialogProps) => {
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [customAllocations, setCustomAllocations] = useState<CustomAllocation[]>([]);
  const [newAllocation, setNewAllocation] = useState<{
    assignee: { type: "employee" | "team"; id: string; name: string } | null;
    percentage: number;
    allocationType: "originator" | "executor" | "support";
  }>({
    assignee: null,
    percentage: 0,
    allocationType: "executor",
  });

  const { data: companies } = useCompanies();
  const { data: templates } = useAllocationTemplates();
  const { bulkAssignRevenues } = useRevenueManagement();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: preSelectedCompanyId || "",
      assignmentMode: "template",
      templateId: "",
    },
  });

  const selectedCompanyId = form.watch("companyId");
  const assignmentMode = form.watch("assignmentMode");
  const selectedTemplateId = form.watch("templateId");

  const { data: revenues } = useRevenues({
    companyId: selectedCompanyId || undefined,
  });

  // Filtrar items sin asignar o parcialmente asignados
  const availableItems = useMemo(() => {
    if (!revenues) return [];
    return revenues.filter((item) => {
      const allocations = item.revenue_allocations || [];
      const totalPercentage = allocations.reduce(
        (sum: number, alloc: any) => sum + (alloc.allocation_percentage || 0),
        0
      );
      return totalPercentage < 100;
    });
  }, [revenues]);

  const selectedItems = useMemo(() => {
    return availableItems.filter((item) => selectedItemIds.has(item.id));
  }, [availableItems, selectedItemIds]);

  const totalSelectedAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.total_amount, 0);
  }, [selectedItems]);

  const totalCustomPercentage = useMemo(() => {
    return customAllocations.reduce((sum, alloc) => sum + alloc.percentage, 0);
  }, [customAllocations]);

  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId || !templates) return null;
    return templates.find((t) => t.id === selectedTemplateId);
  }, [selectedTemplateId, templates]);

  const toggleItem = (itemId: string) => {
    setSelectedItemIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const toggleAll = () => {
    if (selectedItemIds.size === availableItems.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(availableItems.map((item) => item.id)));
    }
  };

  const addCustomAllocation = () => {
    if (!newAllocation.assignee || newAllocation.percentage <= 0) return;

    setCustomAllocations([
      ...customAllocations,
      {
        id: crypto.randomUUID(),
        assignee: newAllocation.assignee,
        percentage: newAllocation.percentage,
        allocationType: newAllocation.allocationType,
      },
    ]);

    setNewAllocation({
      assignee: null,
      percentage: 0,
      allocationType: "executor",
    });
  };

  const removeCustomAllocation = (id: string) => {
    setCustomAllocations(customAllocations.filter((alloc) => alloc.id !== id));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (selectedItemIds.size === 0) {
      return;
    }

    const revenueItemIds = Array.from(selectedItemIds);

    if (values.assignmentMode === "template") {
      if (!values.templateId) return;

      await bulkAssignRevenues.mutateAsync({
        revenueItemIds,
        templateId: values.templateId,
      });
    } else {
      if (customAllocations.length === 0 || totalCustomPercentage !== 100) {
        return;
      }

      await bulkAssignRevenues.mutateAsync({
        revenueItemIds,
        customAllocations: customAllocations.map((alloc) => ({
          employee_id: alloc.assignee.type === "employee" ? alloc.assignee.id : null,
          team_id: alloc.assignee.type === "team" ? alloc.assignee.id : null,
          allocation_percentage: alloc.percentage,
          allocation_type: alloc.allocationType,
        })),
      });
    }

    onOpenChange(false);
    form.reset();
    setSelectedItemIds(new Set());
    setCustomAllocations([]);
  };

  const totalAllocationsToCreate =
    selectedItemIds.size *
    (assignmentMode === "template"
      ? selectedTemplate?.revenue_allocation_template_items?.length || 0
      : customAllocations.length);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Asignación Masiva por Empresa</DialogTitle>
          <DialogDescription>
            Selecciona múltiples ingresos y aplica asignaciones en bloque
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 flex-1 overflow-hidden">
            {/* Selector de Empresa */}
            <FormField
              control={form.control}
              name="companyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona empresa..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies?.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Lista de Items */}
            {selectedCompanyId && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedItemIds.size === availableItems.length && availableItems.length > 0}
                      onCheckedChange={toggleAll}
                    />
                    <Label className="cursor-pointer" onClick={toggleAll}>
                      Seleccionar todos ({availableItems.length} items)
                    </Label>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Seleccionados: {selectedItemIds.size} |{" "}
                    {totalSelectedAmount.toLocaleString("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </div>
                </div>

                <ScrollArea className="h-[200px] border rounded-md p-2">
                  <div className="space-y-2">
                    {availableItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No hay items disponibles para asignar
                      </div>
                    ) : (
                      availableItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 p-2 border rounded hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleItem(item.id)}
                        >
                          <Checkbox
                            checked={selectedItemIds.has(item.id)}
                            onCheckedChange={() => toggleItem(item.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.client_name || "Sin cliente"}</span>
                              <Badge variant="outline" className="text-xs">
                                {format(new Date(item.period), "MMM yyyy", { locale: es })}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground truncate">
                              {item.description}
                            </div>
                          </div>
                          <div className="text-right font-semibold">
                            {item.total_amount.toLocaleString("es-ES", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                <Separator />

                {/* Método de Asignación */}
                <FormField
                  control={form.control}
                  name="assignmentMode"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Método de asignación</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="template" id="template" />
                            <Label htmlFor="template" className="cursor-pointer">
                              Aplicar Template
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom" className="cursor-pointer">
                              Asignación Custom
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {assignmentMode === "template" ? (
                  <FormField
                    control={form.control}
                    name="templateId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona template..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {templates?.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="space-y-4">
                    <Label>Asignaciones Personalizadas</Label>

                    {/* Añadir asignación */}
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="text-xs mb-1 block">Persona/Equipo</Label>
                        <SearchableAssigneeSelector
                          value={newAllocation.assignee}
                          onSelect={(assignee) =>
                            setNewAllocation({ ...newAllocation, assignee })
                          }
                        />
                      </div>
                      <div className="w-24">
                        <Label className="text-xs mb-1 block">%</Label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={newAllocation.percentage || ""}
                          onChange={(e) =>
                            setNewAllocation({
                              ...newAllocation,
                              percentage: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                        />
                      </div>
                      <div className="w-32">
                        <Label className="text-xs mb-1 block">Rol</Label>
                        <Select
                          value={newAllocation.allocationType}
                          onValueChange={(value: any) =>
                            setNewAllocation({ ...newAllocation, allocationType: value })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="originator">Originador</SelectItem>
                            <SelectItem value="executor">Ejecutor</SelectItem>
                            <SelectItem value="support">Soporte</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={addCustomAllocation}
                        disabled={!newAllocation.assignee || newAllocation.percentage <= 0}
                      >
                        Añadir
                      </Button>
                    </div>

                    {/* Lista de asignaciones */}
                    {customAllocations.length > 0 && (
                      <div className="space-y-2">
                        {customAllocations.map((alloc) => (
                          <div
                            key={alloc.id}
                            className="flex items-center gap-2 p-2 border rounded-md bg-muted/20"
                          >
                            <div className="flex-1">
                              <span className="font-medium">{alloc.assignee.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {alloc.assignee.type === "employee" ? "Empleado" : "Equipo"}
                              </Badge>
                            </div>
                            <Badge>{alloc.percentage}%</Badge>
                            <Badge variant="secondary">{alloc.allocationType}</Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCustomAllocation(alloc.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Validación total */}
                    <div className="flex items-center gap-2">
                      {totalCustomPercentage === 100 ? (
                        <Badge variant="default" className="bg-emerald-500">
                          ✓ Total: 100%
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Total: {totalCustomPercentage}% (debe ser 100%)
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Preview */}
                {selectedItemIds.size > 0 && totalAllocationsToCreate > 0 && (
                  <div className="rounded-lg border bg-primary/5 p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        Se crearán {totalAllocationsToCreate} asignaciones
                      </span>
                      <span className="text-muted-foreground">
                        ({selectedItemIds.size} items × {assignmentMode === "template" ? selectedTemplate?.revenue_allocation_template_items?.length || 0 : customAllocations.length} asignaciones)
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  selectedItemIds.size === 0 ||
                  (assignmentMode === "template" && !selectedTemplateId) ||
                  (assignmentMode === "custom" && (customAllocations.length === 0 || totalCustomPercentage !== 100)) ||
                  bulkAssignRevenues.isPending
                }
              >
                {bulkAssignRevenues.isPending ? "Aplicando..." : "✨ Aplicar Asignaciones"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
