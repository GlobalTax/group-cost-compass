import { useState, useEffect } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useEmployees } from "@/hooks/useEmployees";
import { useTeams } from "@/hooks/useTeams";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";

interface AllocationRow {
  id?: string;
  type: 'employee' | 'team';
  assigneeId: string;
  assigneeName: string;
  percentage: number;
}

interface InlineAllocationPopoverProps {
  revenueItem: any;
  trigger: React.ReactNode;
  onSave?: () => void;
}

export const InlineAllocationPopover = ({
  revenueItem,
  trigger,
  onSave,
}: InlineAllocationPopoverProps) => {
  const [open, setOpen] = useState(false);
  const [allocations, setAllocations] = useState<AllocationRow[]>([]);
  const [newType, setNewType] = useState<'employee' | 'team'>('employee');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [newPercentage, setNewPercentage] = useState('');

  const { data: employees } = useEmployees();
  const { data: teams } = useTeams();
  const { bulkAddAllocations, removeAllocation } = useRevenueManagement();

  useEffect(() => {
    if (open && revenueItem) {
      const existing = (revenueItem.revenue_allocations || []).map((a: any) => ({
        id: a.id,
        type: a.employee_id ? 'employee' : 'team',
        assigneeId: a.employee_id || a.team_id,
        assigneeName: a.hr_employees?.full_name || a.teams?.name || '—',
        percentage: a.percentage,
      }));
      setAllocations(existing);
    }
  }, [open, revenueItem]);

  const totalPercentage = allocations.reduce((sum, a) => sum + a.percentage, 0);
  const isValid = totalPercentage === 100;

  const handleAdd = () => {
    if (!newAssigneeId || !newPercentage) return;

    const assignee = newType === 'employee'
      ? employees?.find(e => e.id === newAssigneeId)
      : teams?.find(t => t.id === newAssigneeId);

    if (!assignee) return;

    setAllocations([
      ...allocations,
      {
        type: newType,
        assigneeId: newAssigneeId,
        assigneeName: newType === 'employee' ? (assignee as any).full_name : (assignee as any).name,
        percentage: parseFloat(newPercentage),
      },
    ]);

    setNewAssigneeId('');
    setNewPercentage('');
  };

  const handleRemove = async (index: number) => {
    const allocation = allocations[index];
    if (allocation.id) {
      await removeAllocation.mutateAsync(allocation.id);
    }
    setAllocations(allocations.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!isValid) return;

    const newAllocations = allocations
      .filter(a => !a.id)
      .map(a => ({
        revenue_item_id: revenueItem.id,
        employee_id: a.type === 'employee' ? a.assigneeId : null,
        team_id: a.type === 'team' ? a.assigneeId : null,
        percentage: a.percentage,
      }));

    if (newAllocations.length > 0) {
      await bulkAddAllocations.mutateAsync(newAllocations);
    }

    setOpen(false);
    onSave?.();
  };

  const assigneeOptions = newType === 'employee'
    ? employees?.map(e => ({ id: e.id, name: e.full_name })) || []
    : teams?.map(t => ({ id: t.id, name: t.name })) || [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="w-[480px]" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm">Asignaciones</h4>
            <Badge variant={isValid ? "default" : "destructive"}>
              {totalPercentage}%
            </Badge>
          </div>

          <ScrollArea className="max-h-[240px]">
            <div className="space-y-2">
              {allocations.map((allocation, index) => (
                <div
                  key={`${allocation.type}-${allocation.assigneeId}-${index}`}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded"
                >
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{allocation.assigneeName}</div>
                    <div className="text-xs text-muted-foreground">
                      {allocation.type === 'employee' ? '👤 Persona' : '👥 Equipo'}
                    </div>
                  </div>
                  <div className="font-semibold text-sm">
                    {allocation.percentage}%
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {allocations.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Sin asignaciones
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t pt-4 space-y-3">
            <Label className="text-xs">Añadir asignación</Label>
            
            <div className="flex gap-2">
              <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">👤 Persona</SelectItem>
                  <SelectItem value="team">👥 Equipo</SelectItem>
                </SelectContent>
              </Select>

              <Select value={newAssigneeId} onValueChange={setNewAssigneeId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {assigneeOptions.map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="%"
                value={newPercentage}
                onChange={(e) => setNewPercentage(e.target.value)}
                className="w-20"
                min="0"
                max="100"
              />

              <Button
                size="sm"
                variant="secondary"
                onClick={handleAdd}
                disabled={!newAssigneeId || !newPercentage}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-xs text-muted-foreground">
              {isValid ? '✓ Total válido' : '⚠ Total debe ser 100%'}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!isValid}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
