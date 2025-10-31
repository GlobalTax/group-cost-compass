import { memo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { useCompensationBands, useDeleteCompensationBand } from "@/hooks/useCompensationBands";
import { Skeleton } from "@/components/ui/skeleton";
import { CompensationBandDialog } from "./CompensationBandDialog";
import type { Database } from "@/integrations/supabase/types";

type CompensationBand = Database["public"]["Tables"]["compensation_bands"]["Row"];

const LEVEL_LABELS: Record<string, string> = {
  analyst: "Analyst",
  associate: "Associate",
  senior_associate: "Senior Associate",
  manager: "Manager",
  director: "Director",
  partner: "Partner",
};

export const CompensationBandsTable = memo(() => {
  const { data: bands, isLoading } = useCompensationBands();
  const deleteBand = useDeleteCompensationBand();
  const [editingBand, setEditingBand] = useState<CompensationBand | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const handleEdit = (band: CompensationBand) => {
    setEditingBand(band);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta banda salarial?")) {
      deleteBand.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!bands || bands.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/10 p-8 text-center">
        <p className="text-sm text-muted-foreground">No hay bandas salariales configuradas</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nivel</TableHead>
              <TableHead>Rango Salarial</TableHead>
              <TableHead>Bonus Objetivo</TableHead>
              <TableHead>Bonus Máximo</TableHead>
              <TableHead>Success Fee %</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bands.map((band) => (
              <TableRow key={band.id}>
                <TableCell>
                  <Badge variant="outline">{LEVEL_LABELS[band.level] || band.level}</Badge>
                </TableCell>
                <TableCell>
                  {formatCurrency(Number(band.min_salary))} - {formatCurrency(Number(band.max_salary))}
                </TableCell>
                <TableCell>{Number(band.target_bonus_pct)}%</TableCell>
                <TableCell>{Number(band.max_bonus_pct)}%</TableCell>
                <TableCell>{Number(band.success_fee_base_pct)}%</TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                  {band.description}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(band)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(band.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CompensationBandDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        band={editingBand}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingBand(null);
        }}
      />
    </>
  );
});

CompensationBandsTable.displayName = "CompensationBandsTable";
