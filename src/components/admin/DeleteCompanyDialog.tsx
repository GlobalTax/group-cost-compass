import { useState, useEffect } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useDeleteCompany, useCheckCompanyCanBeDeleted } from '@/hooks/useCompanyManagement';
import type { Company } from '@/lib/supabase/types/enriched';

interface DeleteCompanyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: Company | null;
}

export const DeleteCompanyDialog = ({
  open,
  onOpenChange,
  company,
}: DeleteCompanyDialogProps) => {
  const deleteMutation = useDeleteCompany();
  const checkMutation = useCheckCompanyCanBeDeleted();
  const [canDelete, setCanDelete] = useState(true);
  const [reason, setReason] = useState<string | undefined>();

  useEffect(() => {
    if (open && company) {
      checkMutation.mutate(company.id, {
        onSuccess: (data) => {
          setCanDelete(data.canDelete);
          setReason(data.reason);
        },
      });
    }
  }, [open, company]);

  const handleDelete = async () => {
    if (!company) return;

    try {
      await deleteMutation.mutateAsync(company.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar empresa?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás a punto de eliminar la empresa <strong>{company?.name}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {!canDelete && reason && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{reason}</AlertDescription>
          </Alert>
        )}

        {canDelete && (
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la empresa
            de la base de datos.
          </AlertDialogDescription>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          {canDelete && (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
