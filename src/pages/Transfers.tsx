import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTransfers } from "@/hooks/useTransfers";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/formatters";
import { ArrowRight, Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";

const Transfers = () => {
  const { data: transfers, isLoading } = useTransfers();

  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Traslados"
        subtitle="Historial de movimientos entre empresas del grupo"
      />

      {/* Transfers List */}
      <Card className="p-6 border-gray-200">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : !transfers || transfers.length === 0 ? (
          <div className="text-center py-12 text-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay traslados registrados</p>
            <p className="text-sm mt-2">
              Los traslados entre empresas del grupo aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transfers.map((transfer) => (
              <div
                key={transfer.id}
                className="border border-border rounded-lg p-5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-3">
                      {transfer.hr_employees?.full_name}
                    </h3>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-normal">
                          {transfer.from_company?.name}
                        </Badge>
                        <ArrowRight className="w-5 h-5 text-primary" />
                        <Badge variant="default" className="bg-primary">
                          {transfer.to_company?.name}
                        </Badge>
                      </div>
                    </div>

                    {transfer.reason && (
                      <p className="text-sm text-foreground mt-3">
                        <strong>Motivo:</strong> {transfer.reason}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-foreground">
                      Fecha de traslado
                    </div>
                    <div className="text-sm font-medium">
                      {formatDate(transfer.transfer_date)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Transfers;
