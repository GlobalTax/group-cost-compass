import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Users } from "lucide-react";
import { TeamDialog } from "./TeamDialog";
import { useTeams, useDeleteTeam } from "@/hooks/useTeams";
import type { TeamWithDepartment } from "@/lib/supabase/repositories/teams.repo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const TeamsTable = () => {
  const { data: teams, isLoading } = useTeams();
  const deleteTeam = useDeleteTeam();
  const [selectedTeam, setSelectedTeam] = useState<TeamWithDepartment | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);

  const handleEdit = (team: TeamWithDepartment) => {
    setSelectedTeam(team);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTeamToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (teamToDelete) {
      await deleteTeam.mutateAsync(teamToDelete);
      setDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedTeam(undefined);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando equipos...</div>;
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Departamento</TableHead>
            <TableHead>Miembros</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No hay equipos registrados
                </TableCell>
              </TableRow>
            ) : (
              teams?.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.departments?.name || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {(team as any).hr_employees?.[0]?.count || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={team.is_active ? "success" : "secondary"}>
                      {team.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(team)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(team.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TeamDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        team={selectedTeam}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar equipo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los empleados asignados a este equipo
              quedarán sin equipo asignado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
