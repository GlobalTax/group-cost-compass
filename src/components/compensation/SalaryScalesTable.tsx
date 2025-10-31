import { memo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCompensationBandsByDepartment, useDeleteCompensationBand } from "@/hooks/useCompensationBands";
import { CompensationBandDialog } from "./CompensationBandDialog";
import type { Database } from "@/integrations/supabase/types";

type CompensationBand = Database["public"]["Tables"]["compensation_bands"]["Row"];

interface SalaryScalesTableProps {
  department?: string;
}

const LEVEL_LABELS: Record<string, string> = {
  "IC-1": "Analyst",
  "IC-2": "Senior Analyst",
  "IC-3": "Principal/Specialist",
  "M-1": "Manager",
  "M-2": "Senior Manager",
  "Head": "Head of Department",
  "Director": "Director",
  "Partner": "Partner",
};

export const SalaryScalesTable = memo(({ department }: SalaryScalesTableProps) => {
  const { data: bands, isLoading } = useCompensationBandsByDepartment(department);
  const deleteMutation = useDeleteCompensationBand();

  const [editingBand, setEditingBand] = useState<CompensationBand | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingBand, setDeletingBand] = useState<CompensationBand | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleEdit = (band: CompensationBand) => {
    setEditingBand(band);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingBand) return;
    await deleteMutation.mutateAsync(deletingBand.id);
    setDeletingBand(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingBand(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!bands || bands.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">
          {department
            ? `No hay baremos definidos para ${department}`
            : "No hay baremos definidos. Crea el primero."}
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nivel</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Salario (Min - Max)</TableHead>
            <TableHead>Bonus Target / Max</TableHead>
            <TableHead>Success Fee Base</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bands.map((band) => (
            <TableRow key={band.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{band.level}</div>
                  <div className="text-xs text-muted-foreground">
                    {LEVEL_LABELS[band.level] || "-"}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{band.department}</Badge>
              </TableCell>
              <TableCell>
                <div className="font-mono text-sm">
                  {formatCurrency(band.min_salary)} - {formatCurrency(band.max_salary)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Badge variant="secondary">{band.target_bonus_pct}%</Badge>
                  <Badge variant="outline">{band.max_bonus_pct}%</Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge>{band.success_fee_base_pct}%</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(band)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingBand(band)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CompensationBandDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        band={editingBand || undefined}
        onClose={handleDialogClose}
      />

      <AlertDialog open={!!deletingBand} onOpenChange={() => setDeletingBand(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar baremo?</AlertDialogTitle>
            <AlertDialogDescription>
              Se desactivará el baremo "{deletingBand?.level}" para {deletingBand?.department}.
              Esta acción no es reversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});

SalaryScalesTable.displayName = "SalaryScalesTable";
