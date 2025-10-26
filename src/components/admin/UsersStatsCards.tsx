import { Users, UserCheck, UserX, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRoleStats } from '@/hooks/useUserRoles';

export function UsersStatsCards() {
  const { data: stats, isLoading } = useRoleStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
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
      description: 'Usuarios en el sistema',
    },
    {
      title: 'Con Roles',
      value: stats?.usersWithRoles || 0,
      icon: UserCheck,
      description: 'Usuarios con roles asignados',
    },
    {
      title: 'Sin Roles',
      value: stats?.usersWithoutRoles || 0,
      icon: UserX,
      description: 'Requieren asignación',
      variant: 'warning' as const,
    },
    {
      title: 'Super Admins',
      value: stats?.superAdmins || 0,
      icon: Shield,
      description: 'Administradores del sistema',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className={card.variant === 'warning' ? 'border-warning' : ''}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className={`h-4 w-4 ${card.variant === 'warning' ? 'text-warning' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.variant === 'warning' ? 'text-warning' : ''}`}>
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
