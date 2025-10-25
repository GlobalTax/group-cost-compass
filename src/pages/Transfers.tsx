import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTransfers } from "@/hooks/useTransfers";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/formatters";
import { ArrowRight, Building2 } from "lucide-react";

const Transfers = () => {
  const { data: transfers, isLoading } = useTransfers();

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Traslados Internos</h1>
          <p className="text-muted-foreground mt-1">
            Historial de movimientos entre empresas del grupo
          </p>
        </div>

        {/* Transfers List */}
        <Card className="glass-card p-6">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : !transfers || transfers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
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
                  className="border rounded-lg p-5 hover:bg-accent/50 transition-colors"
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
                        <p className="text-sm text-muted-foreground mt-3">
                          <strong>Motivo:</strong> {transfer.reason}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
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
      </main>
    </div>
  );
};

export default Transfers;
