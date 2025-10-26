import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Settings2, Search } from 'lucide-react';
import { useUsersWithRoles, type UserWithRoles } from '@/hooks/useUserRoles';
import { roleConfig } from '@/lib/roleUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RolesTableProps {
  onManageRoles: (user: UserWithRoles) => void;
}

export function RolesTable({ onManageRoles }: RolesTableProps) {
  const { data: users, isLoading } = useUsersWithRoles();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users?.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Fecha de Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No se encontraron usuarios
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length === 0 ? (
                        <Badge variant="secondary">Sin roles</Badge>
                      ) : (
                        user.roles.map((role) => (
                          <Badge key={role} variant={roleConfig[role].variant}>
                            {roleConfig[role].label}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.created_at), 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onManageRoles(user)}
                    >
                      <Settings2 className="h-4 w-4 mr-2" />
                      Gestionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
