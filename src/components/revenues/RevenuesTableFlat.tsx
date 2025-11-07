import { format } from "date-fns";
import { es } from "date-fns/locale";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Plus } from "lucide-react";
import { InlineAllocationPopover } from "./InlineAllocationPopover";

interface RevenuesTableFlatProps {
  revenues: any[];
  onEdit?: (revenue: any) => void;
  onDelete?: (id: string) => void;
  selectedRows: Set<string>;
  onSelectionChange: (selected: Set<string>) => void;
}

export const RevenuesTableFlat = ({
  revenues,
  onEdit,
  onDelete,
  selectedRows,
  onSelectionChange,
}: RevenuesTableFlatProps) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set(revenues.map(r => r.id)));
    } else {
      onSelectionChange(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedRows);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    onSelectionChange(newSelection);
  };

  const allSelected = revenues.length > 0 && revenues.every(r => selectedRows.has(r.id));
  const someSelected = revenues.some(r => selectedRows.has(r.id)) && !allSelected;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Seleccionar todo"
              className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
            />
          </TableHead>
          <TableHead>Período</TableHead>
          <TableHead>Empresa</TableHead>
          <TableHead>Concepto</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead className="text-right">Importe</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead className="min-w-[200px]">Asignaciones</TableHead>
          <TableHead className="text-center">% Asignado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {revenues.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
              No hay ingresos para mostrar
            </TableCell>
          </TableRow>
        ) : (
          revenues.map((revenue) => {
            const allocations = revenue.revenue_allocations || [];
            const totalPercentage = allocations.reduce(
              (sum: number, a: any) => sum + (a.percentage || 0),
              0
            );
            const isSelected = selectedRows.has(revenue.id);

            return (
              <TableRow
                key={revenue.id}
                className={isSelected ? "bg-muted/50" : ""}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleSelectRow(revenue.id, checked as boolean)
                    }
                    aria-label={`Seleccionar ${revenue.description}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {format(new Date(revenue.period), "MMM yyyy", { locale: es })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{revenue.companies?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {revenue.companies?.nif}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="flex flex-col gap-1">
                    <span className="line-clamp-1 text-sm">{revenue.description}</span>
                    {revenue.category && (
                      <Badge variant="outline" className="w-fit text-xs">
                        {revenue.category}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {revenue.client_name || "—"}
                  </span>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {revenue.total_amount.toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </TableCell>
                <TableCell>
                  {revenue.is_recurring ? (
                    <Badge variant="default" className="bg-emerald-500">
                      Recurrente
                    </Badge>
                  ) : (
                    <Badge variant="secondary">No recurrente</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <InlineAllocationPopover
                    revenueItem={revenue}
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 hover:bg-muted w-full justify-start"
                      >
                        {allocations.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {allocations.map((a: any, idx: number) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="text-xs"
                              >
                                {a.employee_id ? '👤' : '👥'}{' '}
                                {a.hr_employees?.full_name || a.teams?.name || '—'}{' '}
                                {a.percentage}%
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Plus className="h-3 w-3" />
                            <span className="text-xs">Asignar</span>
                          </div>
                        )}
                      </Button>
                    }
                  />
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={totalPercentage === 100 ? "default" : totalPercentage > 0 ? "secondary" : "outline"}
                  >
                    {totalPercentage}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(revenue)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(revenue.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};
