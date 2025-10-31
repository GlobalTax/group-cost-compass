import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Pencil, Trash2 } from 'lucide-react';
import { useDeleteDepartment } from '@/hooks/useDepartments';
import type { Department } from '@/lib/supabase/repositories/departments.repo';

interface DepartmentsTableProps {
  departments: Department[];
  onEdit: (department: Department) => void;
}

export const DepartmentsTable = ({ departments, onEdit }: DepartmentsTableProps) => {
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const deleteMutation = useDeleteDepartment();

  const handleDelete = async () => {
    if (departmentToDelete) {
      await deleteMutation.mutateAsync(departmentToDelete.id);
      setDepartmentToDelete(null);
    }
  };

  if (departments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay departamentos registrados
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((department) => (
              <TableRow key={department.id}>
                <TableCell>
                  <div
                    className="w-8 h-8 rounded-md border"
                    style={{ backgroundColor: department.color || '#6366f1' }}
                  />
                </TableCell>
                <TableCell className="font-medium">{department.name}</TableCell>
                <TableCell className="text-muted-foreground max-w-md truncate">
                  {department.description || '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={department.is_active ? 'default' : 'secondary'}>
                    {department.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(department)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDepartmentToDelete(department)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!departmentToDelete}
        onOpenChange={(open) => !open && setDepartmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar departamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el
              departamento <strong>{departmentToDelete?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
