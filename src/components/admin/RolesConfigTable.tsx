import { Pencil } from 'lucide-react';
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
import type { RoleConfiguration } from '@/lib/supabase/types/enriched';

interface RolesConfigTableProps {
  roles: RoleConfiguration[];
  onEdit: (role: RoleConfiguration) => void;
}

export const RolesConfigTable = ({ roles, onEdit }: RolesConfigTableProps) => {
  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rol</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No hay roles configurados
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {role.role}
                  </code>
                </TableCell>
                <TableCell className="font-medium">{role.display_name}</TableCell>
                <TableCell className="max-w-md text-muted-foreground">
                  {role.description || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={role.is_active ? 'success' : 'secondary'}>
                    {role.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(role)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
