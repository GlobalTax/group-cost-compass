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
import { RevenuesTableFlat } from "./RevenuesTableFlat";
import { BulkActionsToolbar } from "./BulkActionsToolbar";
import { BulkAssignDialog } from "./BulkAssignDialog";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { useAllocationTemplates } from "@/hooks/useAllocationTemplates";
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
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<RevenueFiltersType>({
    amountMin: null,
    amountMax: null,
    allocationStatus: 'all',
    recurrence: 'all',
    conceptSearch: '',
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
  const [flatBulkAssignDialog, setFlatBulkAssignDialog] = useState(false);
  const [flatBulkTemplateDialog, setFlatBulkTemplateDialog] = useState(false);

  const { deleteRevenue, bulkAssignRevenues } = useRevenueManagement();
  const { data: templates } = useAllocationTemplates();

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

  const handleBulkDelete = async () => {
    if (selectedRows.size === 0) return;
    
    const count = selectedRows.size;
    if (!confirm(`¿Eliminar ${count} ${count === 1 ? 'ingreso' : 'ingresos'}?`)) return;

    const deletePromises = Array.from(selectedRows).map(id => 
      deleteRevenue.mutateAsync(id)
    );
    
    await Promise.all(deletePromises);
    setSelectedRows(new Set());
  };

  const handleBulkApplyTemplate = async () => {
    setFlatBulkTemplateDialog(true);
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

      {/* Toolbar de acciones masivas (solo en modo lista) */}
      {viewMode === 'list' && selectedRows.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedRows.size}
          onBulkAssignPerson={() => setFlatBulkAssignDialog(true)}
          onBulkAssignTeam={() => setFlatBulkAssignDialog(true)}
          onBulkApplyTemplate={handleBulkApplyTemplate}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedRows(new Set())}
        />
      )}

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
                          conceptSearch: '',
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
          <RevenuesTableFlat
            revenues={filteredRevenues}
            onEdit={onEdit}
            onDelete={onDelete}
            selectedRows={selectedRows}
            onSelectionChange={setSelectedRows}
          />
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

      <BulkAssignDialog
        open={flatBulkAssignDialog}
        onOpenChange={setFlatBulkAssignDialog}
        selectedRevenueIds={Array.from(selectedRows)}
        onSuccess={() => setSelectedRows(new Set())}
      />
    </>
  );
};
