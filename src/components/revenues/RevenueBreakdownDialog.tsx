import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatPeriodShort } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";

interface RevenueBreakdownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assigneeName: string;
  month: string;
  items: any[];
  total: number;
}

export const RevenueBreakdownDialog = ({
  open,
  onOpenChange,
  assigneeName,
  month,
  items,
  total,
}: RevenueBreakdownDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            Desglose de {assigneeName} - {formatPeriodShort(month + "-01")}
          </DialogTitle>
          <DialogDescription>
            Total del mes: <span className="font-bold text-foreground">{formatCurrency(total)}</span>
          </DialogDescription>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead className="text-center">Tipo</TableHead>
              <TableHead className="text-right">Monto Total</TableHead>
              <TableHead className="text-right">Monto Asignado</TableHead>
              <TableHead className="text-right">% Asignación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => {
              const allocatedAmount = item.allocated_amount || item.total_amount;
              const percentage = item.allocation_percentage || 100;
              
              return (
                <TableRow key={`${item.id}-${index}`}>
                  <TableCell className="font-medium">
                    {item.client_name || "—"}
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="truncate" title={item.description}>
                      {item.description}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {item.is_recurring ? (
                      <Badge variant="secondary">Recurrente</Badge>
                    ) : (
                      <Badge variant="outline">Puntual</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(item.total_amount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {formatCurrency(allocatedAmount)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {percentage}%
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {items.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No hay ingresos para este período
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
