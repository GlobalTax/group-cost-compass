import { useState, useMemo } from "react";
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
import { Pencil, Trash2, Users, ChevronDown, ChevronRight, List, Filter, UserCheck } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RevenueAllocationsManager } from "./RevenueAllocationsManager";
import { ClientGroupRow } from "./ClientGroupRow";
import { BatchTemplateDialog } from "./BatchTemplateDialog";
import { RevenueFilters } from "./RevenueFilters";
import { BulkAssignByCompanyDialog } from "./BulkAssignByCompanyDialog";
import { 
  groupRevenuesByClient, 
  filterClientGroups,
  filterRevenueItems,
  type ClientGroup,
  type RevenueFilters as RevenueFiltersType
} from "@/lib/utils/revenueGrouping";

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
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');
  const [filters, setFilters] = useState<RevenueFiltersType>({
    amountMin: null,
    amountMax: null,
    allocationStatus: 'all',
    recurrence: 'all',
  });
  const [batchTemplateDialog, setBatchTemplateDialog] = useState<{
    open: boolean;
    group: ClientGroup | null;
    category: string;
  }>({
    open: false,
    group: null,
    category: '',
  });
  const [bulkAssignDialog, setBulkAssignDialog] = useState<{
    open: boolean;
    companyId?: string;
  }>({
    open: false,
    companyId: undefined,
  });

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const clientGroups = useMemo(() => {
    return groupRevenuesByClient(revenues);
  }, [revenues]);

  const filteredClientGroups = useMemo(() => {
    return filterClientGroups(clientGroups, filters);
  }, [clientGroups, filters]);

  const filteredRevenues = useMemo(() => {
    return filterRevenueItems(revenues, filters);
  }, [revenues, filters]);

  const handleApplyTemplate = (group: ClientGroup, category: string) => {
    setBatchTemplateDialog({
      open: true,
      group,
      category,
    });
  };

  const handleBulkAssign = (group?: ClientGroup) => {
    setBulkAssignDialog({
      open: true,
      companyId: group?.companyId,
    });
  };

  if (!revenues || revenues.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay ingresos registrados
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Switch
            id="group-view"
            checked={viewMode === 'grouped'}
            onCheckedChange={(checked) => setViewMode(checked ? 'grouped' : 'list')}
          />
          <Label htmlFor="group-view" className="flex items-center gap-2 cursor-pointer">
            {viewMode === 'grouped' ? (
              <>
                <Users className="h-4 w-4" />
                Agrupado por Cliente
              </>
            ) : (
              <>
                <List className="h-4 w-4" />
                Lista Completa
              </>
            )}
          </Label>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => handleBulkAssign()}>
            <UserCheck className="h-4 w-4 mr-2" />
            Asignación Masiva
          </Button>
          {viewMode === 'grouped' && (
            <div className="text-sm text-muted-foreground">
              {clientGroups.length} clientes · {revenues.length} conceptos
            </div>
          )}
        </div>
      </div>

      {/* Filtros avanzados */}
      <div className="mb-4">
        <RevenueFilters
          filters={filters}
          onFiltersChange={setFilters}
          totalCount={viewMode === 'grouped' ? clientGroups.length : revenues.length}
          filteredCount={viewMode === 'grouped' ? filteredClientGroups.length : filteredRevenues.length}
        />
      </div>

      <ScrollArea className="h-[600px]">
        {viewMode === 'grouped' ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Categorías</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Conceptos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Filter className="h-8 w-8 opacity-20" />
                      <p>No se encontraron grupos que cumplan los filtros</p>
                      <Button
                        variant="link"
                        onClick={() => setFilters({
                          amountMin: null,
                          amountMax: null,
                          allocationStatus: 'all',
                          recurrence: 'all',
                        })}
                        size="sm"
                      >
                        Limpiar filtros
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredClientGroups.map((group) => (
                  <ClientGroupRow
                    key={`${group.clientName}_${group.period}_${group.companyId}`}
                    group={group}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onApplyTemplate={handleApplyTemplate}
                    onBulkAssign={handleBulkAssign}
                  />
                ))
              )}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
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
              {filteredRevenues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Filter className="h-8 w-8 opacity-20" />
                      <p>No se encontraron ingresos que cumplan los filtros</p>
                      <Button
                        variant="link"
                        onClick={() => setFilters({
                          amountMin: null,
                          amountMax: null,
                          allocationStatus: 'all',
                          recurrence: 'all',
                        })}
                        size="sm"
                      >
                        Limpiar filtros
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRevenues.map((revenue) => {
                  const allocations = revenue.revenue_allocations || [];
                  const uniqueAssignees = new Set(
                    allocations.map((a: any) => 
                      a.hr_employees?.full_name || a.teams?.name
                    ).filter(Boolean)
                  );

                  const isExpanded = expandedRows.has(revenue.id);

                  return (
                    <Collapsible
                      key={revenue.id}
                      open={isExpanded}
                      onOpenChange={() => toggleRow(revenue.id)}
                      asChild
                    >
                      <>
                        <TableRow>
                          <TableCell>
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

                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell colSpan={9} className="p-0">
                              <div className="bg-muted/30 p-4 border-t">
                                <RevenueAllocationsManager revenueItem={revenue} />
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </ScrollArea>

      <BatchTemplateDialog
        open={batchTemplateDialog.open}
        onOpenChange={(open) =>
          setBatchTemplateDialog((prev) => ({ ...prev, open }))
        }
        group={batchTemplateDialog.group}
        category={batchTemplateDialog.category}
      />

      <BulkAssignByCompanyDialog
        open={bulkAssignDialog.open}
        onOpenChange={(open) =>
          setBulkAssignDialog((prev) => ({ ...prev, open }))
        }
        preSelectedCompanyId={bulkAssignDialog.companyId}
      />
    </>
  );
};
