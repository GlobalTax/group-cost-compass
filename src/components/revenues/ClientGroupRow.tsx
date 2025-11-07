import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronDown,
  ChevronRight,
  Users,
  Zap,
  FileSpreadsheet,
  Layers,
  UserCheck,
} from "lucide-react";
import { TableCell, TableRow, Table, TableHeader, TableHead, TableBody } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConceptRow } from "./ConceptRow";
import type { ClientGroup } from "@/lib/utils/revenueGrouping";

interface ClientGroupRowProps {
  group: ClientGroup;
  onEdit?: (revenue: any) => void;
  onDelete?: (id: string) => void;
  onApplyTemplate?: (group: ClientGroup, category: string) => void;
  onBulkAssign?: (group: ClientGroup) => void;
}

export const ClientGroupRow = ({
  group,
  onEdit,
  onDelete,
  onApplyTemplate,
  onBulkAssign,
}: ClientGroupRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const assignmentStatus = useMemo(() => {
    const totalItems = group.items.length;
    const fullyAssigned = group.items.filter((item) => {
      const allocations = item.revenue_allocations || [];
      const totalPercentage = allocations.reduce(
        (sum: number, alloc: any) => sum + (alloc.allocation_percentage || 0),
        0
      );
      return allocations.length > 0 && totalPercentage >= 99.9;
    }).length;

    const partiallyAssigned = group.items.filter((item) => {
      const allocations = item.revenue_allocations || [];
      const totalPercentage = allocations.reduce(
        (sum: number, alloc: any) => sum + (alloc.allocation_percentage || 0),
        0
      );
      return allocations.length > 0 && totalPercentage < 99.9;
    }).length;

    const unassigned = totalItems - fullyAssigned - partiallyAssigned;

    return { totalItems, fullyAssigned, partiallyAssigned, unassigned };
  }, [group.items]);

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} asChild>
      <>
        {/* Fila principal del grupo */}
        <TableRow className="bg-muted/40 hover:bg-muted/60">
          <TableCell className="w-12">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </TableCell>

          <TableCell className="font-bold">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              {group.clientName}
              {assignmentStatus.unassigned === 0 ? (
                <Badge variant="default" className="bg-emerald-500 text-xs">
                  ✓ Completo
                </Badge>
              ) : assignmentStatus.partiallyAssigned > 0 || assignmentStatus.fullyAssigned > 0 ? (
                <Badge variant="secondary" className="text-xs">
                  ⚠️ Parcial ({assignmentStatus.fullyAssigned}/{assignmentStatus.totalItems})
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  ❌ Sin asignar
                </Badge>
              )}
            </div>
          </TableCell>

          <TableCell>
            {format(group.period, "MMM yyyy", { locale: es })}
          </TableCell>

          <TableCell>
            <span className="text-sm">{group.companyName}</span>
          </TableCell>

          <TableCell>
            <div className="flex flex-wrap gap-1">
              {group.categories.map((cat) => (
                <Badge key={cat} variant="outline" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
          </TableCell>

          <TableCell className="text-right">
            <div className="flex flex-col items-end gap-1">
              <span className="font-bold text-lg">
                {group.totalAmount.toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </span>
              {group.hasRecurring && (
                <Badge variant="default" className="bg-emerald-500 text-xs">
                  Recurrente
                </Badge>
              )}
            </div>
          </TableCell>

          <TableCell>
            <span className="text-sm text-muted-foreground">
              {group.items.length} {group.items.length === 1 ? 'concepto' : 'conceptos'}
            </span>
          </TableCell>

          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Zap className="h-4 w-4 mr-1" />
                  Templates
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aplicar por categoría</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {group.categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => onApplyTemplate?.(group, category)}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    {category} (
                    {group.items.filter((i) => i.category === category).length})
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onApplyTemplate?.(group, 'all')}>
                  <Layers className="h-4 w-4 mr-2" />
                  Todos los conceptos
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onBulkAssign?.(group)}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Asignación masiva de grupo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>

        {/* Contenido expandible: conceptos individuales */}
        <CollapsibleContent asChild>
          <TableRow>
            <TableCell colSpan={8} className="p-0">
              <div className="bg-background/50 border-l-4 border-primary/20">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Importe</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Asignaciones</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.items.map((item) => (
                      <ConceptRow
                        key={item.id}
                        item={item}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
};
