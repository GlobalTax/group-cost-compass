import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useUsersWithRoles } from '@/hooks/useUserRoles';
import { useDeleteUser } from '@/hooks/useUserManagement';
import { roleConfig } from '@/lib/roleUtils';
import { Search, Trash2, Shield } from 'lucide-react';
import type { UserWithRoles } from '@/hooks/useUserRoles';

interface UsersTableProps {
  onManageRoles: (user: UserWithRoles) => void;
  filterNoRoles?: boolean;
}

export function UsersTable({ onManageRoles, filterNoRoles = false }: UsersTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState<UserWithRoles | null>(null);
  const { data: users = [], isLoading } = useUsersWithRoles();
  const deleteUser = useDeleteUser();

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterNoRoles || user.roles.length === 0;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async () => {
    if (!userToDelete) return;
    await deleteUser.mutateAsync(userToDelete.id);
    setUserToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Fecha de Registro</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow 
                  key={user.id}
                  className={user.roles.length === 0 ? 'bg-warning/5' : ''}
                >
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    {user.roles.length === 0 ? (
                      <Badge variant="warning">Sin roles</Badge>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant={roleConfig[role].variant}>
                            {roleConfig[role].label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success">Activo</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onManageRoles(user)}
                    >
                      <Shield className="h-4 w-4 mr-1" />
                      Gestionar Roles
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setUserToDelete(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al usuario <strong>{userToDelete?.email}</strong> y
              todos sus roles asignados. Esta acción no se puede deshacer.
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
}
