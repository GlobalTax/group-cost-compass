import { useState } from 'react';
import { formatDate } from '@/lib/formatters';
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
import { Eye, Edit, Trash2, Copy, CheckCircle2, XCircle } from 'lucide-react';
import { CreateJobPostingDialog } from './CreateJobPostingDialog';
import { useDeleteJobPosting, useDuplicateJobPosting, usePublishJobPosting, useCloseJobPosting } from '@/hooks/useJobPostings';
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

interface JobPosting {
  id: string;
  title: string;
  department?: string;
  status: string;
  published_at?: string;
  created_at: string;
  candidates_count?: number;
  employment_type?: string;
  location?: string;
}

interface JobPostingsTableProps {
  jobPostings: JobPosting[];
}

const statusConfig = {
  draft: { label: 'Borrador', variant: 'secondary' as const },
  published: { label: 'Publicada', variant: 'success' as const },
  closed: { label: 'Cerrada', variant: 'outline' as const },
};

export function JobPostingsTable({ jobPostings }: JobPostingsTableProps) {
  const [editingPosting, setEditingPosting] = useState<JobPosting | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deletePosting = useDeleteJobPosting();
  const duplicatePosting = useDuplicateJobPosting();
  const publishPosting = usePublishJobPosting();
  const closePosting = useCloseJobPosting();

  const handleDelete = async () => {
    if (!deletingId) return;
    await deletePosting.mutateAsync(deletingId);
    setDeletingId(null);
  };

  if (jobPostings.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay vacantes creadas. Crea la primera vacante.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Candidatos</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobPostings.map((posting) => {
              const statusInfo = statusConfig[posting.status as keyof typeof statusConfig] || {
                label: posting.status || 'Desconocido',
                variant: 'outline' as const
              };
              return (
                <TableRow key={posting.id}>
                  <TableCell className="font-medium">{posting.title}</TableCell>
                  <TableCell>{posting.department || '-'}</TableCell>
                  <TableCell>{posting.location || '-'}</TableCell>
                  <TableCell className="capitalize">{posting.employment_type || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </TableCell>
                  <TableCell>{posting.candidates_count || 0}</TableCell>
                  <TableCell>
                    {posting.published_at
                      ? formatDate(posting.published_at)
                      : formatDate(posting.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {posting.status === 'draft' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => publishPosting.mutate(posting.id)}
                          title="Publicar"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      {posting.status === 'published' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => closePosting.mutate(posting.id)}
                          title="Cerrar"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingPosting(posting)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => duplicatePosting.mutate(posting.id)}
                        title="Duplicar"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingId(posting.id)}
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

      {editingPosting && (
        <CreateJobPostingDialog
          open={!!editingPosting}
          onOpenChange={(open) => !open && setEditingPosting(null)}
          jobPosting={editingPosting}
        />
      )}

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar vacante?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La vacante será eliminada permanentemente.
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
