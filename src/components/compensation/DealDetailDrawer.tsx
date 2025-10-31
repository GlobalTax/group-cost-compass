import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useDeal } from "@/hooks/useDeals";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DealDetailDrawerProps {
  dealId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_LABELS: Record<string, string> = {
  pipeline: "Pipeline",
  active: "Activo",
  closed: "Cerrado",
  lost: "Perdido",
};

export function DealDetailDrawer({ dealId, open, onOpenChange }: DealDetailDrawerProps) {
  const { data: deal, isLoading } = useDeal(dealId || undefined);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Detalle de Operación</DrawerTitle>
        </DrawerHeader>

        <div className="overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : !deal ? (
            <p className="text-center text-muted-foreground">Operación no encontrada</p>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-semibold">{deal.deal_name}</h2>
                  <Badge>{STATUS_LABELS[deal.status] || deal.status}</Badge>
                </div>
                {deal.client_name && (
                  <p className="text-muted-foreground">Cliente: {deal.client_name}</p>
                )}
              </div>

              {/* Información financiera */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Honorarios Totales</span>
                  </div>
                  <p className="text-2xl font-semibold">{formatCurrency(Number(deal.total_fees))}</p>
                </div>

                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Success Fee Pool</span>
                  </div>
                  <p className="text-2xl font-semibold">{formatCurrency(Number(deal.success_fee_pool))}</p>
                </div>
              </div>

              {/* Información adicional */}
              <div className="space-y-3">
                {deal.lead_partner && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Partner Lead:</span>
                    <span className="font-medium">{deal.lead_partner.full_name}</span>
                  </div>
                )}

                {deal.close_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Fecha de cierre:</span>
                    <span className="font-medium">
                      {format(new Date(deal.close_date), "dd MMMM yyyy", { locale: es })}
                    </span>
                  </div>
                )}

                {deal.deal_type && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Tipo de operación:</span>
                    <span className="font-medium">{deal.deal_type}</span>
                  </div>
                )}
              </div>

              {/* Equipo participante */}
              {deal.participants && deal.participants.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Equipo Participante</h3>
                  <div className="space-y-2">
                    {deal.participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                      >
                        <div>
                          <p className="font-medium">{participant.employee.full_name}</p>
                          {participant.role_in_deal && (
                            <p className="text-sm text-muted-foreground">{participant.role_in_deal}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{Number(participant.participation_pct)}%</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(Number(participant.bonus_amount))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              {deal.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Notas</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{deal.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
