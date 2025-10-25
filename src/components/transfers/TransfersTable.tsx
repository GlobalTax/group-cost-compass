import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import { formatDate } from "@/lib/formatters";

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
}

interface TransfersTableProps {
  transfers: Transfer[];
  isLoading?: boolean;
  onEmployeeClick: (employeeId: string) => void;
  onExport: () => void;
}

const getDaysBadgeColor = (days?: number) => {
  if (!days) return "bg-muted text-muted-foreground";
  if (days <= 7) return "bg-success-light text-success";
  if (days <= 30) return "bg-warning-light text-warning-foreground";
  if (days <= 90) return "bg-orange-100 text-orange-800";
  if (days <= 180) return "bg-blue-100 text-blue-800";
  return "bg-muted text-muted-foreground";
};

export const TransfersTable = ({
  transfers,
  isLoading,
  onEmployeeClick,
  onExport,
}: TransfersTableProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="text-center py-12 text-foreground">
        <p>No hay traslados que mostrar</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empleado</TableHead>
            <TableHead>Desde</TableHead>
            <TableHead>Hacia</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Días entre contratos</TableHead>
            <TableHead>Motivo</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.map((transfer) => (
            <TableRow
              key={transfer.id}
              className="cursor-pointer"
              onClick={() => onEmployeeClick(transfer.hr_employees.id)}
            >
              <TableCell className="font-medium">
                {transfer.hr_employees.full_name}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{transfer.from_company.name}</Badge>
              </TableCell>
              <TableCell>
                <Badge className="bg-primary">
                  {transfer.to_company.name}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(transfer.transfer_date)}</TableCell>
              <TableCell>
                {transfer.daysBetween !== undefined ? (
                  <Badge
                    variant="outline"
                    className={getDaysBadgeColor(transfer.daysBetween)}
                  >
                    {transfer.daysBetween} días
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {transfer.reason || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
