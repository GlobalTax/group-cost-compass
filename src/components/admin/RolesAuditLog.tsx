import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useRolesAudit } from '@/hooks/useUserRoles';
import { roleConfig } from '@/lib/roleUtils';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RolesAuditLog() {
  const { data: auditLogs, isLoading } = useRolesAudit();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registro de Auditoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro de Auditoría</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Usuario Afectado</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Realizado Por</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {auditLogs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No hay registros de auditoría
                  </TableCell>
                </TableRow>
              ) : (
                auditLogs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.user_email || log.user_id}
                    </TableCell>
                    <TableCell>
                      <Badge variant={roleConfig[log.role].variant}>
                        {roleConfig[log.role].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.action === 'assigned' ? 'success' : 'destructive'}>
                        {log.action === 'assigned' ? 'Asignado' : 'Revocado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.performer_email || log.performed_by || 'Sistema'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
