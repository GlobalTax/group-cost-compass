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
import { Eye, Edit } from "lucide-react";
import { useDeals } from "@/hooks/useDeals";
import { Skeleton } from "@/components/ui/skeleton";
import { DealDetailDrawer } from "./DealDetailDrawer";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DealsTableProps {
  filters?: {
    status?: string;
    fiscalYear?: number;
  };
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "success" | "destructive" }> = {
  pipeline: { label: "Pipeline", variant: "secondary" },
  active: { label: "Activo", variant: "default" },
  closed: { label: "Cerrado", variant: "success" },
  lost: { label: "Perdido", variant: "destructive" },
};

export const DealsTable = memo(({ filters }: DealsTableProps) => {
  const { data: deals, isLoading } = useDeals(filters);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!deals || deals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/10 p-8 text-center">
        <p className="text-sm text-muted-foreground">No hay operaciones registradas</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Operación</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Honorarios</TableHead>
              <TableHead>Success Fee Pool</TableHead>
              <TableHead>Partner Lead</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Fecha Cierre</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.map((deal) => (
              <TableRow key={deal.id}>
                <TableCell className="font-medium">{deal.deal_name}</TableCell>
                <TableCell>{deal.client_name || "—"}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_LABELS[deal.status]?.variant || "default"}>
                    {STATUS_LABELS[deal.status]?.label || deal.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(Number(deal.total_fees))}</TableCell>
                <TableCell>{formatCurrency(Number(deal.success_fee_pool))}</TableCell>
                <TableCell>{deal.lead_partner?.full_name || "—"}</TableCell>
                <TableCell>
                  <Badge variant="outline">{deal.participants?.length || 0}</Badge>
                </TableCell>
                <TableCell>
                  {deal.close_date
                    ? format(new Date(deal.close_date), "dd MMM yyyy", { locale: es })
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDealId(deal.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DealDetailDrawer
        dealId={selectedDealId}
        open={!!selectedDealId}
        onOpenChange={(open) => !open && setSelectedDealId(null)}
      />
    </>
  );
});

DealsTable.displayName = "DealsTable";
