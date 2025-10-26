import { Card, CardContent } from '@/components/ui/card';
import { Users, Shield, UserCog, AlertCircle } from 'lucide-react';
import { useRoleStats } from '@/hooks/useUserRoles';
import { Skeleton } from '@/components/ui/skeleton';

export function RoleStatsCards() {
  const { data: stats, isLoading } = useRoleStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Usuarios',
      value: stats?.totalUsers || 0,
      icon: Users,
      description: 'Usuarios registrados',
    },
    {
      title: 'Super Admins',
      value: stats?.superAdmins || 0,
      icon: Shield,
      description: 'Administradores principales',
    },
    {
      title: 'Con Roles',
      value: stats?.usersWithRoles || 0,
      icon: UserCog,
      description: 'Usuarios con permisos',
    },
    {
      title: 'Sin Roles',
      value: stats?.usersWithoutRoles || 0,
      icon: AlertCircle,
      description: 'Requieren asignación',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="apollo-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold mt-2">{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </div>
                <Icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
