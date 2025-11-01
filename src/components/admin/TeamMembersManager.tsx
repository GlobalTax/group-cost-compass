import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserPlus, UserMinus, Users } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useUpdateEmployeeTeam } from "@/hooks/useUpdateEmployeeTeam";
import { useCompanies } from "@/hooks/useCompanies";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Employee = Database["public"]["Tables"]["hr_employees"]["Row"];

interface TeamMembersManagerProps {
  teamId: string | null;
  departmentId: string;
  currentMembers: Employee[];
  onMembersChange?: () => void;
  orgId: string;
}

export const TeamMembersManager = ({
  teamId,
  departmentId,
  currentMembers,
  onMembersChange,
  orgId,
}: TeamMembersManagerProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: availableEmployees = [] } = useEmployees({
    activeOnly: true,
  });

  const { data: companies = [] } = useCompanies();
  
  const updateEmployeeTeam = useUpdateEmployeeTeam();

  // Mapa de ID empresa → nombre para resolver en currentMembers
  const companyNameById = useMemo(
    () => new Map(companies.map((c) => [c.id, c.name])),
    [companies]
  );

  // Excluir empleados que ya están en el equipo actual
  const currentMemberIds = new Set(currentMembers.map((m) => m.id));
  
  // Mostrar todos los empleados activos, pero indicar cuáles no pueden ser seleccionados
  const filteredEmployees = availableEmployees.filter((emp) =>
    !currentMemberIds.has(emp.id) &&
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Empleados seleccionables (misma organización)
  const selectableEmployees = filteredEmployees.filter(emp => emp.org_id === orgId);

  const handleToggleEmployee = (employeeId: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleAddMembers = async () => {
    if (!teamId) {
      toast.error("Error: No se ha guardado el equipo todavía");
      return;
    }

    try {
      const results = await Promise.allSettled(
        selectedEmployeeIds.map((employeeId) => {
          // Obtener el team_id actual del empleado para auditoría correcta
          const employee = availableEmployees.find((e) => e.id === employeeId);
          const oldTeamId = employee?.team_id ?? null;
          
          return updateEmployeeTeam.mutateAsync({
            employeeId,
            newTeamId: teamId,
            oldTeamId,
          });
        })
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (successful > 0) {
        toast.success(
          `${successful} miembro${successful > 1 ? "s" : ""} añadido${
            successful > 1 ? "s" : ""
          } correctamente`
        );
      }

      if (failed > 0) {
        const errors = results
          .filter((r): r is PromiseRejectedResult => r.status === "rejected")
          .map((r) => r.reason?.message || "Error desconocido");

        toast.error(
          `${failed} empleado${
            failed > 1 ? "s" : ""
          } no pudieron ser añadidos: ${errors[0]}`
        );
      }

      // Solo cerrar y refrescar si todos fueron exitosos
      if (failed === 0 && successful > 0) {
        onMembersChange?.();
        setSelectedEmployeeIds([]);
        setIsAddDialogOpen(false);
        setSearchTerm("");
      }
    } catch (error) {
      console.error("Error crítico al añadir miembros:", error);
      toast.error("Error inesperado al añadir miembros");
    }
  };

  const handleRemoveMember = async (employeeId: string) => {
    if (!teamId) {
      toast.error("Error: El equipo no está guardado");
      return;
    }

    try {
      await updateEmployeeTeam.mutateAsync({
        employeeId,
        newTeamId: null,
        oldTeamId: teamId,
      });
      
      toast.success("Miembro removido correctamente");
      onMembersChange?.();
    } catch (error: any) {
      console.error("Error al remover miembro:", error);
      toast.error(`No se pudo remover el miembro: ${error.message || "Error desconocido"}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Miembros del Equipo</h3>
          <Badge variant="outline">{currentMembers.length}</Badge>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => setIsAddDialogOpen(true)}
          disabled={!departmentId}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Añadir Miembros
        </Button>
      </div>

      {currentMembers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <p className="mt-4 text-sm text-muted-foreground">
            No hay miembros asignados. Añade empleados para comenzar.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Posición</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead className="w-[100px]">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.full_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.position || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.company_id ? (companyNameById.get(member.company_id) || "—") : "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={updateEmployeeTeam.isPending}
                    >
                      <UserMinus className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} modal={false}>
        <DialogContent 
          className="max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Añadir Miembros al Equipo</DialogTitle>
            <DialogDescription>
              Selecciona los empleados del departamento que quieres añadir al
              equipo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Buscar empleados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
            />

            {filteredEmployees.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay empleados disponibles.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {filteredEmployees.length} empleado{filteredEmployees.length !== 1 ? 's' : ''} activo{filteredEmployees.length !== 1 ? 's' : ''}
                  </p>
                  {selectableEmployees.length < filteredEmployees.length && (
                    <p className="text-xs text-muted-foreground">
                      {filteredEmployees.length - selectableEmployees.length} de otra organización
                    </p>
                  )}
                </div>
                
                <div className="max-h-[400px] overflow-y-auto rounded-lg border">
                  <TooltipProvider>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox
                              checked={
                                selectedEmployeeIds.length === selectableEmployees.length &&
                                selectableEmployees.length > 0
                              }
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedEmployeeIds(selectableEmployees.map((e) => e.id));
                                } else {
                                  setSelectedEmployeeIds([]);
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Posición</TableHead>
                          <TableHead>Empresa</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEmployees.map((employee) => {
                          const isSameOrg = employee.org_id === orgId;
                          const isSelectable = isSameOrg;
                          
                          return (
                            <TableRow key={employee.id} className={!isSelectable ? "opacity-60" : ""}>
                              <TableCell>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <Checkbox
                                        checked={selectedEmployeeIds.includes(employee.id)}
                                        onCheckedChange={() => handleToggleEmployee(employee.id)}
                                        disabled={!isSelectable}
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  {!isSelectable && (
                                    <TooltipContent>
                                      <p>El empleado pertenece a otra organización</p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {employee.full_name}
                                  {!isSelectable && (
                                    <Badge variant="outline" className="text-xs">
                                      Otra org.
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {employee.position || "—"}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {employee.companies?.name || "—"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TooltipProvider>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setSelectedEmployeeIds([]);
                  setSearchTerm("");
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleAddMembers}
                disabled={
                  selectedEmployeeIds.length === 0 ||
                  updateEmployeeTeam.isPending
                }
              >
                Añadir {selectedEmployeeIds.length > 0 && `(${selectedEmployeeIds.length})`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
