import { useState } from "react";
import { Copy, CheckCircle2, XCircle, Calendar, Euro, FileSpreadsheet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useDuplicateCleanup, type DuplicateGroup } from "@/hooks/useDuplicateCleanup";
import { formatCurrency } from "@/lib/formatters";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DuplicateCleanupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DuplicateCleanupDialog = ({ open, onOpenChange }: DuplicateCleanupDialogProps) => {
  const { detectDuplicates, cleanupMutation } = useDuplicateCleanup();
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  const handleScan = async () => {
    setIsScanning(true);
    try {
      const groups = await detectDuplicates();
      setDuplicates(groups);
      setHasScanned(true);
    } catch (error) {
      console.error("Error scanning duplicates:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCleanup = async () => {
    const allToDelete = duplicates.flatMap((g) => g.toDelete);
    await cleanupMutation.mutateAsync(allToDelete);
    onOpenChange(false);
    setHasScanned(false);
    setDuplicates([]);
  };

  const totalToDelete = duplicates.reduce((sum, g) => sum + g.toDelete.length, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Limpieza de Empleados Duplicados
          </DialogTitle>
          <DialogDescription>
            Detecta y elimina automáticamente registros duplicados manteniendo el más completo
          </DialogDescription>
        </DialogHeader>

        {!hasScanned ? (
          <div className="py-12 text-center space-y-4">
            <Copy className="w-16 h-16 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Analizaremos todos los empleados para encontrar duplicados<br />
              basándonos en nombre y empresa
            </p>
            <Button onClick={handleScan} disabled={isScanning}>
              {isScanning ? "Escaneando..." : "Escanear Duplicados"}
            </Button>
          </div>
        ) : duplicates.length === 0 ? (
          <div className="py-12 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 mx-auto text-success" />
            <p className="text-sm text-muted-foreground">
              No se encontraron empleados duplicados
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-[50vh] pr-4">
              <div className="space-y-4">
                {duplicates.map((group, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{group.name}</h4>
                        <p className="text-sm text-muted-foreground">{group.companyName}</p>
                      </div>
                      <Badge variant="destructive">
                        {group.employees.length} duplicados
                      </Badge>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      {group.employees.map((emp, empIdx) => {
                        const isKept = emp.id === group.toKeep;
                        return (
                          <div
                            key={emp.id}
                            className={`flex items-center justify-between p-3 rounded-md border ${
                              isKept
                                ? "bg-success/10 border-success"
                                : "bg-muted/50 border-border"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isKept ? (
                                <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                              ) : (
                                <XCircle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              )}
                              <div className="text-sm space-y-1">
                                <div className="font-medium">
                                  {isKept ? "✓ Mantener" : "✗ Eliminar"}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(emp.createdAt), "dd/MM/yyyy", { locale: es })}
                                  </span>
                                  {emp.annualSalary && (
                                    <span className="flex items-center gap-1">
                                      <Euro className="w-3 h-3" />
                                      {formatCurrency(emp.annualSalary)}
                                    </span>
                                  )}
                                  {emp.costsCount > 0 && (
                                    <span className="flex items-center gap-1">
                                      <FileSpreadsheet className="w-3 h-3" />
                                      {emp.costsCount} nóminas
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <DialogFooter className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Se eliminarán <strong>{totalToDelete}</strong> registro(s) duplicado(s)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCleanup}
                  disabled={cleanupMutation.isPending}
                >
                  {cleanupMutation.isPending ? "Eliminando..." : "Limpiar Duplicados"}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
