import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/skeleton";

interface TransfersTabProps {
  transfers: Array<{
    id: string;
    transfer_date: string;
    reason?: string | null;
    from_company?: { name: string } | null;
    to_company?: { name: string } | null;
  }>;
  isLoading?: boolean;
}

export const TransfersTab = ({ transfers, isLoading }: TransfersTabProps) => {
  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!transfers || transfers.length === 0) {
    return (
      <Card className="p-8">
        <p className="text-center text-foreground">
          No hay traslados registrados para este empleado
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {transfers.map((transfer, index) => (
        <Card key={transfer.id} className="p-6 relative">
          {/* Timeline connector */}
          {index < transfers.length - 1 && (
            <div className="absolute left-1/2 -bottom-6 w-0.5 h-6 bg-border -translate-x-1/2" />
          )}

          <div className="flex items-center justify-between gap-4">
            {/* From Company */}
            <div className="flex-1 text-right">
              <div className="inline-flex items-center justify-end gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <p className="text-lg font-semibold text-foreground">
                  {transfer.from_company?.name || "—"}
                </p>
              </div>
              <p className="text-xs text-foreground mt-1">
                Empresa origen
              </p>
            </div>

            {/* Arrow and Date */}
            <div className="flex flex-col items-center gap-2 min-w-[180px]">
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-12 bg-primary" />
                <ArrowRight className="w-5 h-5 text-primary" />
                <div className="h-0.5 w-12 bg-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {formatDate(transfer.transfer_date)}
                </p>
                {transfer.reason && (
                  <p className="text-xs text-foreground mt-1 max-w-[200px]">
                    {transfer.reason}
                  </p>
                )}
              </div>
            </div>

            {/* To Company */}
            <div className="flex-1 text-left">
              <div className="inline-flex items-center gap-2">
                <p className="text-lg font-semibold text-foreground">
                  {transfer.to_company?.name || "—"}
                </p>
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              <p className="text-xs text-foreground mt-1">
                Empresa destino
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
