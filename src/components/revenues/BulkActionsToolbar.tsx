import { UserCheck, Users, FileSpreadsheet, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BulkActionsToolbarProps {
  selectedCount: number;
  onBulkAssignPerson: () => void;
  onBulkAssignTeam: () => void;
  onBulkApplyTemplate: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export const BulkActionsToolbar = ({
  selectedCount,
  onBulkAssignPerson,
  onBulkAssignTeam,
  onBulkApplyTemplate,
  onBulkDelete,
  onClearSelection,
}: BulkActionsToolbarProps) => {
  return (
    <Card className="p-4 mb-4 border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="font-semibold text-sm">
            ✓ {selectedCount} {selectedCount === 1 ? 'ingreso seleccionado' : 'ingresos seleccionados'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkAssignPerson}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Asignar a Persona
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onBulkAssignTeam}
          >
            <Users className="h-4 w-4 mr-2" />
            Asignar a Equipo
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onBulkApplyTemplate}
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Aplicar Template
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onBulkDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>

          <div className="h-6 w-px bg-border" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
          >
            <X className="h-4 w-4 mr-2" />
            Deseleccionar
          </Button>
        </div>
      </div>
    </Card>
  );
};
