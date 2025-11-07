import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAllocationTemplates, useAllocationTemplateManagement } from "@/hooks/useAllocationTemplates";
import { formatCurrency } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApplyTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revenueItemId: string;
  totalAmount: number;
}

const ALLOCATION_TYPE_LABELS = {
  originator: "Originador",
  executor: "Ejecutor",
  support: "Soporte",
};

export const ApplyTemplateDialog = ({ 
  open, 
  onOpenChange, 
  revenueItemId, 
  totalAmount 
}: ApplyTemplateDialogProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const { data: templates } = useAllocationTemplates();
  const { applyTemplate } = useAllocationTemplateManagement();

  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);

  const handleApply = async () => {
    if (!selectedTemplateId) return;

    try {
      await applyTemplate.mutateAsync({
        templateId: selectedTemplateId,
        revenueItemId,
        totalAmount,
      });
      onOpenChange(false);
      setSelectedTemplateId("");
    } catch (error) {
      console.error("Error applying template:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Aplicar Template de Asignación</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info del ingreso */}
          <Alert>
            <AlertDescription>
              Ingreso seleccionado: <strong>{formatCurrency(totalAmount)}</strong>
            </AlertDescription>
          </Alert>

          {/* Selector de template */}
          <div>
            <Label>Seleccionar Template *</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Elige un template" />
              </SelectTrigger>
              <SelectContent>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                    {template.is_default && " (Predeterminado)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview del template */}
          {selectedTemplate && (
            <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
              <h4 className="font-semibold">Preview de Asignaciones</h4>
              <div className="space-y-2">
                {selectedTemplate.revenue_allocation_template_items?.map((item) => {
                  const calculatedAmount = (totalAmount * (item.allocation_percentage || 0)) / 100;
                  return (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {item.hr_employees?.full_name || item.teams?.name}
                        </span>
                        {item.allocation_type && (
                          <Badge variant="secondary" className="text-xs">
                            {ALLOCATION_TYPE_LABELS[item.allocation_type as keyof typeof ALLOCATION_TYPE_LABELS]}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {item.allocation_percentage}%
                        </span>
                        <span className="font-bold">
                          {formatCurrency(calculatedAmount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-3 border-t flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleApply}
              disabled={!selectedTemplateId || applyTemplate.isPending}
            >
              {applyTemplate.isPending ? "Aplicando..." : "Aplicar Template"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
