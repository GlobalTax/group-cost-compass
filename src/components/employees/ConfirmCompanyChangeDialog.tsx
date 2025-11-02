import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Building2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConfirmCompanyChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName: string;
  fromCompanyName: string;
  toCompanyName: string;
  onConfirm: (reason: string) => void;
}

export const ConfirmCompanyChangeDialog = ({
  open,
  onOpenChange,
  employeeName,
  fromCompanyName,
  toCompanyName,
  onConfirm,
}: ConfirmCompanyChangeDialogProps) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Debes indicar el motivo del cambio");
      return;
    }
    onConfirm(reason.trim());
    setReason("");
    setError("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    setReason("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Confirmar cambio de empresa
          </DialogTitle>
          <DialogDescription>
            Vas a cambiar la empresa de <strong>{employeeName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="space-y-1">
                <p><strong>De:</strong> {fromCompanyName}</p>
                <p><strong>A:</strong> {toCompanyName}</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="reason">
              Motivo del cambio <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Ej: Error en alta inicial, asignación incorrecta..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              rows={3}
              className={error ? "border-destructive" : ""}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <Alert variant="default" className="bg-muted">
            <AlertDescription className="text-xs">
              <strong>Nota:</strong> Este cambio quedará registrado en el historial de auditoría. 
              Para traslados formales entre empresas, usa la pestaña "Traslados".
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>
            Confirmar cambio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
