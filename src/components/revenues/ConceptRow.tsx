import { useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2, Users } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RevenueAllocationsManager } from "./RevenueAllocationsManager";

interface ConceptRowProps {
  item: any;
  onEdit?: (revenue: any) => void;
  onDelete?: (id: string) => void;
}

export const ConceptRow = ({ item, onEdit, onDelete }: ConceptRowProps) => {
  const [showAllocations, setShowAllocations] = useState(false);

  const allocations = item.revenue_allocations || [];
  const uniqueAssignees = new Set(
    allocations
      .map((a: any) => a.hr_employees?.full_name || a.teams?.name)
      .filter(Boolean)
  );

  return (
    <Collapsible
      open={showAllocations}
      onOpenChange={setShowAllocations}
      asChild
    >
      <>
        <TableRow className="hover:bg-muted/30">
          <TableCell className="w-12">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {showAllocations ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            </CollapsibleTrigger>
          </TableCell>

          <TableCell className="max-w-xs">
            <span className="text-sm line-clamp-2">
              {item.description || '—'}
            </span>
          </TableCell>

          <TableCell>
            {item.category && (
              <Badge variant="outline" className="text-xs">
                {item.category}
              </Badge>
            )}
          </TableCell>

          <TableCell className="text-right font-medium">
            {Number(item.total_amount).toLocaleString('es-ES', {
              style: 'currency',
              currency: 'EUR',
            })}
          </TableCell>

          <TableCell>
            {item.is_recurring ? (
              <Badge variant="default" className="bg-emerald-500 text-xs">
                Recurrente
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">
                No recurrente
              </Badge>
            )}
          </TableCell>

          <TableCell>
            {allocations.length > 0 ? (
              <div className="flex items-center gap-2">
                <Users className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">
                  {uniqueAssignees.size}
                </span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Sin asignar</span>
            )}
          </TableCell>

          <TableCell className="text-right">
            <div className="flex justify-end gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(item)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>

        <CollapsibleContent asChild>
          <TableRow>
            <TableCell colSpan={7} className="p-0">
              <div className="bg-muted/20 p-4 border-t">
                <RevenueAllocationsManager revenueItem={item} />
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
};
