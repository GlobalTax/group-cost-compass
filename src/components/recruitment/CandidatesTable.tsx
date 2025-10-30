import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { CreateCandidateDialog } from './CreateCandidateDialog';
import { CandidateDetailDrawer } from './CandidateDetailDrawer';
import { useDeleteCandidate } from '@/hooks/useCandidates';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  skills: string[];
  years_experience: number;
  status: string;
  source: string;
}

interface CandidatesTableProps {
  candidates: Candidate[];
}

const statusConfig = {
  new: { label: 'Nuevo', variant: 'secondary' as const },
  in_process: { label: 'En Proceso', variant: 'default' as const },
  hired: { label: 'Contratado', variant: 'success' as const },
  rejected: { label: 'Rechazado', variant: 'destructive' as const },
  on_hold: { label: 'En Espera', variant: 'outline' as const },
};

export function CandidatesTable({ candidates }: CandidatesTableProps) {
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [viewingCandidate, setViewingCandidate] = useState<Candidate | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleteCandidate = useDeleteCandidate();

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteCandidate.mutateAsync(deletingId);
    setDeletingId(null);
  };

  if (candidates.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay candidatos registrados. Añade el primer candidato.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Experiencia</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => {
              const statusInfo = statusConfig[candidate.status as keyof typeof statusConfig] || {
                label: candidate.status || 'Desconocido',
                variant: 'outline' as const
              };
              return (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium">
                    {candidate.first_name} {candidate.last_name}
                  </TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>{candidate.phone || '-'}</TableCell>
                  <TableCell>{candidate.years_experience} años</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {candidate.skills.slice(0, 2).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{candidate.skills.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </TableCell>
                  <TableCell className="capitalize">{candidate.source}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingCandidate(candidate)}
                        title="Ver detalle"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingCandidate(candidate)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(candidate.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {editingCandidate && (
        <CreateCandidateDialog
          open={!!editingCandidate}
          onOpenChange={(open) => !open && setEditingCandidate(null)}
          candidate={editingCandidate}
        />
      )}

      {viewingCandidate && (
        <CandidateDetailDrawer
          open={!!viewingCandidate}
          onOpenChange={(open) => !open && setViewingCandidate(null)}
          candidateId={viewingCandidate.id}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar candidato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El candidato será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
