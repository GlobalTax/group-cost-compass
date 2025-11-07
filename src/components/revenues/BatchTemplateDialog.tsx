import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllocationTemplates } from "@/hooks/useAllocationTemplates";
import { useAllocationTemplateManagement } from "@/hooks/useAllocationTemplates";
import { toast } from "sonner";
import type { ClientGroup } from "@/lib/utils/revenueGrouping";

interface BatchTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: ClientGroup | null;
  category: string;
}

export const BatchTemplateDialog = ({
  open,
  onOpenChange,
  group,
  category,
}: BatchTemplateDialogProps) => {
  const { data: templates } = useAllocationTemplates();
  const { applyTemplate } = useAllocationTemplateManagement();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [applying, setApplying] = useState(false);

  if (!group) return null;

  const itemsToProcess = category === 'all'
    ? group.items
    : group.items.filter(item => item.category === category);

  const handleApplyBatch = async () => {
    if (!selectedTemplateId) {
      toast.error("Selecciona un template");
      return;
    }

    setApplying(true);
    let successCount = 0;
    let errorCount = 0;

    for (const item of itemsToProcess) {
      try {
        await applyTemplate.mutateAsync({
          templateId: selectedTemplateId,
          revenueItemId: item.id,
          totalAmount: Number(item.total_amount),
        });
        successCount++;
      } catch (error) {
        console.error(`Error applying template to ${item.id}:`, error);
        errorCount++;
      }
    }

    setApplying(false);
    onOpenChange(false);
    setSelectedTemplateId("");

    if (errorCount > 0) {
      toast.warning(
        `Template aplicado: ${successCount} exitosos, ${errorCount} fallidos`
      );
    } else {
      toast.success(`Template aplicado a ${successCount} conceptos`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Aplicar Template en Batch</DialogTitle>
          <DialogDescription>
            Cliente: <strong>{group.clientName}</strong>
            <br />
            Categoría: <strong>{category === 'all' ? 'Todas las categorías' : category}</strong>
            <br />
            Conceptos a procesar: <strong>{itemsToProcess.length}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="template-select">Seleccionar Template</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Elige un template de asignación" />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                    {template.is_default && " (Por defecto)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg p-3 max-h-64 overflow-y-auto bg-muted/20">
            <h4 className="text-sm font-semibold mb-2">Conceptos afectados:</h4>
            <ul className="space-y-1 text-sm">
              {itemsToProcess.map((item) => (
                <li key={item.id} className="flex justify-between py-1">
                  <span className="text-muted-foreground truncate flex-1 mr-2">
                    {item.description || item.category || 'Sin descripción'}
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    {Number(item.total_amount).toLocaleString('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-100 dark:bg-amber-950 p-3 rounded-lg text-sm border border-amber-200 dark:border-amber-900">
            ⚠️ Esta acción creará asignaciones para{' '}
            <strong>{itemsToProcess.length}</strong> conceptos usando el template
            seleccionado. Las asignaciones existentes no se eliminarán.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleApplyBatch}
            disabled={!selectedTemplateId || applying}
          >
            {applying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aplicando...
              </>
            ) : (
              `Aplicar a ${itemsToProcess.length} concepto${itemsToProcess.length !== 1 ? 's' : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
