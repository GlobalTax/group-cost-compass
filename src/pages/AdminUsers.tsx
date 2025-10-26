import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { UsersStatsCards } from '@/components/admin/UsersStatsCards';
import { UsersTable } from '@/components/admin/UsersTable';
import { InviteUserDialog } from '@/components/admin/InviteUserDialog';
import { ManageRolesDialog } from '@/components/admin/ManageRolesDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import type { UserWithRoles } from '@/hooks/useUserRoles';

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  const handleManageRoles = (user: UserWithRoles) => {
    setSelectedUser(user);
    setRolesDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Administración de Usuarios"
        subtitle="Gestiona usuarios del sistema, envía invitaciones y asigna roles"
        action={
          <Button onClick={() => setInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invitar Usuario
          </Button>
        }
      />

      <div className="container mx-auto p-6 space-y-6" id="main-content">
        <UsersStatsCards />

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Todos los Usuarios</TabsTrigger>
            <TabsTrigger value="no-roles">Sin Roles</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <UsersTable onManageRoles={handleManageRoles} />
          </TabsContent>

          <TabsContent value="no-roles" className="space-y-6">
            <UsersTable onManageRoles={handleManageRoles} filterNoRoles />
          </TabsContent>
        </Tabs>

        <InviteUserDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
        />

        <ManageRolesDialog
          user={selectedUser}
          open={rolesDialogOpen}
          onOpenChange={setRolesDialogOpen}
        />
      </div>
    </div>
  );
}
