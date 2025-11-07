import { useState } from "react";
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
import { Pencil, Trash2, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RevenuesTableProps {
  revenues: any[];
  onEdit?: (revenue: any) => void;
  onDelete?: (id: string) => void;
}

export const RevenuesTable = ({
  revenues,
  onEdit,
  onDelete,
}: RevenuesTableProps) => {
  if (!revenues || revenues.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay ingresos registrados
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Período</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Importe</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Asignaciones</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {revenues.map((revenue) => {
            const allocations = revenue.revenue_allocations || [];
            const uniqueAssignees = new Set(
              allocations.map((a: any) => 
                a.hr_employees?.full_name || a.teams?.name
              ).filter(Boolean)
            );

            return (
              <TableRow key={revenue.id}>
                <TableCell className="font-medium">
                  {format(new Date(revenue.period), "MMM yyyy", { locale: es })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{revenue.companies?.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {revenue.companies?.nif}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <div className="flex flex-col gap-1">
                    <span className="line-clamp-1">{revenue.description}</span>
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
                  {allocations.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {uniqueAssignees.size} {uniqueAssignees.size === 1 ? 'asignación' : 'asignaciones'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin asignar</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
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
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};
