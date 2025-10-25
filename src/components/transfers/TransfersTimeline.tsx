import { Building2, ArrowDown, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatters";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Transfer {
  id: string;
  transfer_date: string;
  reason?: string;
  hr_employees: {
    id: string;
    full_name: string;
  };
  from_company: {
    id: string;
    name: string;
  };
  to_company: {
    id: string;
    name: string;
  };
  daysBetween?: number;
  isRecent?: boolean;
  daysAgo?: number;
}

interface TransfersTimelineProps {
  transfers: Transfer[];
  onEmployeeClick: (employeeId: string) => void;
}

const getDaysBadgeColor = (days?: number) => {
  if (!days) return "bg-muted text-muted-foreground";
  if (days <= 7) return "bg-success-light text-success";
  if (days <= 30) return "bg-warning-light text-warning-foreground";
  if (days <= 90) return "bg-orange-100 text-orange-800";
  if (days <= 180) return "bg-blue-100 text-blue-800";
  return "bg-muted text-muted-foreground";
};

export const TransfersTimeline = ({
  transfers,
  onEmployeeClick,
}: TransfersTimelineProps) => {
  // Group transfers by employee
  const groupedTransfers = transfers.reduce((acc, transfer) => {
    const employeeId = transfer.hr_employees.id;
    if (!acc[employeeId]) {
      acc[employeeId] = {
        employeeName: transfer.hr_employees.full_name,
        transfers: [],
      };
    }
    acc[employeeId].transfers.push(transfer);
    return acc;
  }, {} as Record<string, { employeeName: string; transfers: Transfer[] }>);

  if (transfers.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-foreground">No hay traslados registrados</p>
        <p className="text-sm text-muted-foreground mt-2">
          Los traslados entre empresas del grupo aparecerán aquí
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransfers).map(
        ([employeeId, { employeeName, transfers: empTransfers }]) => (
          <Card
            key={employeeId}
            className="p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onEmployeeClick(employeeId)}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              {employeeName}
              <Badge variant="outline" className="font-normal">
                {empTransfers.length}{" "}
                {empTransfers.length === 1 ? "traslado" : "traslados"}
              </Badge>
            </h3>

            <div className="space-y-4">
              {empTransfers.map((transfer, index) => (
                <div key={transfer.id} className="relative">
                  {/* Origin company */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      {index < empTransfers.length - 1 && (
                        <div className="w-0.5 h-12 bg-border my-2" />
                      )}
                    </div>

                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">
                          {transfer.from_company.name}
                        </Badge>
                        <ArrowDown className="w-4 h-4 text-muted-foreground" />
                        <Badge className="bg-primary">
                          {transfer.to_company.name}
                        </Badge>
                        {transfer.isRecent && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge className="bg-purple-light text-purple-foreground">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Reciente
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                Traslado realizado hace {transfer.daysAgo} días
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground mb-2">
                        Fecha de traslado: {formatDate(transfer.transfer_date)}
                      </div>

                      {transfer.daysBetween !== undefined && (
                        <Badge
                          variant="outline"
                          className={getDaysBadgeColor(transfer.daysBetween)}
                        >
                          {transfer.daysBetween} días entre contratos
                        </Badge>
                      )}

                      {transfer.reason && (
                        <p className="text-sm text-foreground mt-2">
                          <strong>Motivo:</strong> {transfer.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )
      )}
    </div>
  );
};
