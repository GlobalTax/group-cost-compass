import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RoleStatsCards } from '@/components/admin/RoleStatsCards';
import { RolesTable } from '@/components/admin/RolesTable';
import { ManageRolesDialog } from '@/components/admin/ManageRolesDialog';
import { RolesAuditLog } from '@/components/admin/RolesAuditLog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UserWithRoles } from '@/hooks/useUserRoles';

export default function AdminRoles() {
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleManageRoles = (user: UserWithRoles) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Gestión de Roles"
        subtitle="Administra los roles y permisos de los usuarios del sistema"
      />

      <div className="container mx-auto p-6 space-y-6" id="main-content">
        <RoleStatsCards />

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="audit">Auditoría</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <RolesTable onManageRoles={handleManageRoles} />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <RolesAuditLog />
          </TabsContent>
        </Tabs>

        <ManageRolesDialog
          user={selectedUser}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </div>
  );
}
