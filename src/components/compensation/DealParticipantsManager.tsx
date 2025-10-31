import { useState } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { useAddDealParticipant, useUpdateDealParticipant, useRemoveDealParticipant } from "@/hooks/useDeals";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DealWithParticipants } from "@/lib/supabase/repositories/deals.repo";

interface DealParticipantsManagerProps {
  deal: DealWithParticipants;
}

const DEAL_ROLES = [
  "originator",
  "lead",
  "analyst",
  "support",
  "counsel",
  "senior_advisor",
] as const;

const ROLE_LABELS: Record<string, string> = {
  originator: "Originador",
  lead: "Lead",
  analyst: "Analista",
  support: "Soporte",
  counsel: "Counsel",
  senior_advisor: "Senior Advisor",
};

export function DealParticipantsManager({ deal }: DealParticipantsManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [role, setRole] = useState("");
  const [participationPct, setParticipationPct] = useState("0");

  const { data: employees } = useEmployees({ activeOnly: true });
  const addParticipant = useAddDealParticipant();
  const updateParticipant = useUpdateDealParticipant();
  const removeParticipant = useRemoveDealParticipant();

  const totalParticipation = deal.participants.reduce(
    (sum, p) => sum + Number(p.participation_pct),
    0
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const handleAddParticipant = async () => {
    if (!selectedEmployeeId || !role || !participationPct) {
      return;
    }

    const pct = Number(participationPct);
    if (pct <= 0 || pct > 100) {
      return;
    }

    // Validar que no exceda 100%
    if (totalParticipation + pct > 100) {
      return;
    }

    const bonusAmount = (Number(deal.success_fee_pool) * pct) / 100;

    await addParticipant.mutateAsync({
      deal_id: deal.id,
      employee_id: selectedEmployeeId,
      role_in_deal: role,
      participation_pct: pct,
      bonus_amount: bonusAmount,
    });

    // Reset form
    setSelectedEmployeeId("");
    setRole("");
    setParticipationPct("0");
    setIsDialogOpen(false);
  };

  const handleRemoveParticipant = async (participantId: string) => {
    await removeParticipant.mutateAsync(participantId);
  };

  const availableEmployees = employees?.filter(
    (emp) => !deal.participants.some((p) => p.employee_id === emp.id)
  );

  const remainingPct = 100 - totalParticipation;
  const isOverAllocated = totalParticipation > 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Equipo Participante</h3>
          <p className="text-sm text-muted-foreground">
            Total asignado: {totalParticipation.toFixed(1)}% • Disponible: {remainingPct.toFixed(1)}%
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={remainingPct <= 0}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir Participante
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Participante</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Empleado</Label>
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEmployees?.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rol en la Operación</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEAL_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Participación (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max={remainingPct}
                  step="0.1"
                  value={participationPct}
                  onChange={(e) => setParticipationPct(e.target.value)}
                  placeholder="0.0"
                />
                <p className="text-xs text-muted-foreground">
                  Máximo disponible: {remainingPct.toFixed(1)}%
                </p>
              </div>

              {participationPct && Number(participationPct) > 0 && (
                <div className="rounded-lg border bg-muted p-3">
                  <p className="text-sm font-medium">Bonus Calculado:</p>
                  <p className="text-xl font-bold">
                    {formatCurrency((Number(deal.success_fee_pool) * Number(participationPct)) / 100)}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddParticipant}
                  disabled={!selectedEmployeeId || !role || Number(participationPct) <= 0}
                >
                  Añadir
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isOverAllocated && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ⚠️ La participación total excede el 100%. Ajusta los porcentajes.
          </AlertDescription>
        </Alert>
      )}

      {deal.participants.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">No hay participantes asignados</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Participación</TableHead>
              <TableHead className="text-right">Bonus</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deal.participants.map((participant) => (
              <TableRow key={participant.id}>
                <TableCell className="font-medium">{participant.employee.full_name}</TableCell>
                <TableCell>{ROLE_LABELS[participant.role_in_deal] || participant.role_in_deal}</TableCell>
                <TableCell className="text-right">{Number(participant.participation_pct)}%</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(Number(participant.bonus_amount))}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveParticipant(participant.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
