import { useState } from 'react';
import { Shield } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RolesConfigTable } from '@/components/admin/RolesConfigTable';
import { RoleConfigDialog } from '@/components/admin/RoleConfigDialog';
import { useRoleConfigurations } from '@/hooks/useRoleConfiguration';
import type { RoleConfiguration } from '@/lib/supabase/types/enriched';

export default function AdminRolesConfig() {
  const { data: roles = [], isLoading } = useRoleConfigurations();
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleConfiguration | null>(null);

  const handleEdit = (role: RoleConfiguration) => {
    setSelectedRole(role);
    setShowConfigDialog(true);
  };

  const handleCloseDialog = () => {
    setShowConfigDialog(false);
    setSelectedRole(null);
  };

  const activeRoles = roles.filter((r) => r.is_active).length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Configuración de Roles"
        subtitle="Administra los roles del sistema y sus permisos"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Roles</CardDescription>
            <CardTitle className="text-3xl">{roles.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="text-sm">Configurados en el sistema</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Roles Activos</CardDescription>
            <CardTitle className="text-3xl text-success">{activeRoles}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Disponibles para asignar</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles del Sistema</CardTitle>
          <CardDescription>
            Configura los nombres y descripciones de los roles disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : (
            <RolesConfigTable roles={roles} onEdit={handleEdit} />
          )}
        </CardContent>
      </Card>

      <RoleConfigDialog
        open={showConfigDialog}
        onOpenChange={handleCloseDialog}
        roleConfig={selectedRole}
      />
    </div>
  );
}
