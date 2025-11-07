import { useState, useMemo } from "react";
import { User, Users, Plus, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { AddAllocationDialog } from "./AddAllocationDialog";
import { ApplyTemplateDialog } from "./ApplyTemplateDialog";
import { toast } from "sonner";

interface RevenueAllocationsManagerProps {
  revenueItem: {
    id: string;
    total_amount: number;
    revenue_allocations?: Array<{
      id: string;
      employee_id: string | null;
      team_id: string | null;
      allocated_amount: number | null;
      allocation_percentage: number | null;
      allocation_type: string | null;
      notes: string | null;
      hr_employees?: { id: string; full_name: string };
      teams?: { id: string; name: string };
    }>;
  };
}

const ALLOCATION_TYPE_BADGES = {
  originator: { label: "Originador", variant: "default" as const },
  executor: { label: "Ejecutor", variant: "secondary" as const },
  support: { label: "Soporte", variant: "outline" as const },
};

export const RevenueAllocationsManager = ({
  revenueItem,
}: RevenueAllocationsManagerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isApplyTemplateOpen, setIsApplyTemplateOpen] = useState(false);
  const { removeAllocation } = useRevenueManagement();

  const allocations = revenueItem.revenue_allocations || [];

  const { totalAllocated, totalPercentage, remainingAmount, remainingPercentage } = useMemo(() => {
    let totalAmt = 0;
    let totalPct = 0;

    allocations.forEach((alloc) => {
      if (alloc.allocated_amount !== null) {
        totalAmt += alloc.allocated_amount;
      }
      if (alloc.allocation_percentage !== null) {
        totalPct += alloc.allocation_percentage;
      }
    });

    return {
      totalAllocated: totalAmt,
      totalPercentage: totalPct,
      remainingAmount: revenueItem.total_amount - totalAmt,
      remainingPercentage: 100 - totalPct,
    };
  }, [allocations, revenueItem.total_amount]);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta asignación?")) return;

    try {
      await removeAllocation.mutateAsync(id);
    } catch (error) {
      console.error("Error deleting allocation:", error);
    }
  };

  const getStatusColor = () => {
    if (totalPercentage > 100 || totalAllocated > revenueItem.total_amount) {
      return "bg-destructive/10 border-destructive";
    }
    if (totalPercentage === 100 || totalAllocated === revenueItem.total_amount) {
      return "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900";
    }
    if (totalPercentage > 0 || totalAllocated > 0) {
      return "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900";
    }
    return "bg-background border-border";
  };

  return (
    <div className="space-y-4">
      {/* Header with KPIs */}
      <div className={`flex items-center justify-between rounded-lg border p-3 ${getStatusColor()}`}>
        <div>
          <h4 className="font-semibold mb-1">Asignaciones de Ingreso</h4>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>
              Asignado: {totalAllocated.toLocaleString("es-ES", { style: "currency", currency: "EUR" })} / {revenueItem.total_amount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })}
            </span>
            <span>
              Porcentaje: {totalPercentage.toFixed(1)}% / 100%
            </span>
          </div>
          {remainingAmount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Disponible: {remainingAmount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })} ({remainingPercentage.toFixed(1)}%)
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setIsApplyTemplateOpen(true)}
          >
            <Zap className="h-4 w-4 mr-1" />
            Aplicar Template
          </Button>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Añadir Asignación
          </Button>
        </div>
      </div>

      {/* Allocations Table */}
      {allocations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No hay asignaciones. Haz clic en "Añadir Asignación" para comenzar.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asignado A</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right">Porcentaje</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allocations.map((allocation) => {
              const assigneeName = allocation.hr_employees?.full_name || allocation.teams?.name || "—";
              const isEmployee = allocation.employee_id !== null;

              return (
                <TableRow key={allocation.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {isEmployee ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {assigneeName.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{assigneeName}</span>
                        </>
                      ) : (
                        <>
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-sm font-medium">{assigneeName}</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {allocation.allocation_type && ALLOCATION_TYPE_BADGES[allocation.allocation_type as keyof typeof ALLOCATION_TYPE_BADGES] ? (
                      <Badge variant={ALLOCATION_TYPE_BADGES[allocation.allocation_type as keyof typeof ALLOCATION_TYPE_BADGES].variant}>
                        {ALLOCATION_TYPE_BADGES[allocation.allocation_type as keyof typeof ALLOCATION_TYPE_BADGES].label}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {allocation.allocated_amount !== null
                      ? allocation.allocated_amount.toLocaleString("es-ES", { style: "currency", currency: "EUR" })
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {allocation.allocation_percentage !== null
                      ? `${allocation.allocation_percentage.toFixed(1)}%`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {allocation.notes || "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(allocation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <AddAllocationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        revenueItemId={revenueItem.id}
        totalAmount={revenueItem.total_amount}
        currentAllocations={{
          totalAmount: totalAllocated,
          totalPercentage: totalPercentage,
        }}
      />

      <ApplyTemplateDialog
        open={isApplyTemplateOpen}
        onOpenChange={setIsApplyTemplateOpen}
        revenueItemId={revenueItem.id}
        totalAmount={revenueItem.total_amount}
      />
    </div>
  );
};
