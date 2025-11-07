import { useState } from "react";
import { UserCheck, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEmployees } from "@/hooks/useEmployees";
import { useTeams } from "@/hooks/useTeams";
import { useRevenueManagement } from "@/hooks/useRevenueManagement";
import { Badge } from "@/components/ui/badge";

interface BulkAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRevenueIds: string[];
  onSuccess?: () => void;
}

export const BulkAssignDialog = ({
  open,
  onOpenChange,
  selectedRevenueIds,
  onSuccess,
}: BulkAssignDialogProps) => {
  const [assigneeType, setAssigneeType] = useState<'employee' | 'team'>('employee');
  const [assigneeId, setAssigneeId] = useState('');
  const [percentage, setPercentage] = useState('100');
  const [mode, setMode] = useState<'replace' | 'add'>('add');

  const { data: employees } = useEmployees();
  const { data: teams } = useTeams();
  const { bulkAssignRevenues } = useRevenueManagement();

  const handleSubmit = async () => {
    if (!assigneeId || !percentage) return;

    const customAllocations = [{
      employee_id: assigneeType === 'employee' ? assigneeId : null,
      team_id: assigneeType === 'team' ? assigneeId : null,
      allocation_percentage: parseFloat(percentage),
    }];

    await bulkAssignRevenues.mutateAsync({
      revenueItemIds: selectedRevenueIds,
      customAllocations,
      mode,
    });

    onOpenChange(false);
    onSuccess?.();
  };

  const assigneeOptions = assigneeType === 'employee'
    ? employees?.map(e => ({ id: e.id, name: e.full_name })) || []
    : teams?.map(t => ({ id: t.id, name: t.name })) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Asignación Masiva</DialogTitle>
          <DialogDescription>
            Asignar {selectedRevenueIds.length} {selectedRevenueIds.length === 1 ? 'ingreso' : 'ingresos'} seleccionados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo de asignación</Label>
            <RadioGroup
              value={assigneeType}
              onValueChange={(v: any) => setAssigneeType(v)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employee" id="employee" />
                <Label htmlFor="employee" className="flex items-center gap-2 cursor-pointer">
                  <UserCheck className="h-4 w-4" />
                  Persona
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="team" id="team" />
                <Label htmlFor="team" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4" />
                  Equipo
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>
              {assigneeType === 'employee' ? 'Empleado' : 'Equipo'}
            </Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label>Porcentaje (%)</Label>
            <Input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              min="0"
              max="100"
              placeholder="100"
            />
          </div>

          <div className="space-y-2">
            <Label>Modo de asignación</Label>
            <RadioGroup
              value={mode}
              onValueChange={(v: any) => setMode(v)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="add" id="add" />
                <Label htmlFor="add" className="cursor-pointer font-normal">
                  Añadir a las asignaciones existentes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="replace" id="replace" />
                <Label htmlFor="replace" className="cursor-pointer font-normal">
                  Reemplazar asignaciones existentes
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm font-medium mb-2">Vista previa</div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {selectedRevenueIds.length} {selectedRevenueIds.length === 1 ? 'ingreso' : 'ingresos'}
              </Badge>
              <span>→</span>
              <Badge>
                {assigneeType === 'employee' ? '👤' : '👥'}{' '}
                {assigneeOptions.find(o => o.id === assigneeId)?.name || '—'}{' '}
                ({percentage}%)
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {mode === 'replace' ? 'Se eliminarán las asignaciones existentes' : 'Se añadirán a las asignaciones existentes'}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!assigneeId || !percentage || bulkAssignRevenues.isPending}
          >
            {bulkAssignRevenues.isPending ? 'Asignando...' : 'Asignar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
