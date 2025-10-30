import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useOnboardingStats } from '@/hooks/useOnboarding';
import { Skeleton } from '@/components/ui/skeleton';

export function OnboardingKPIs() {
  const { data: stats, isLoading } = useOnboardingStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const kpis = [
    {
      title: 'Total Activos',
      value: stats.pending + stats.inProgress,
      icon: Users,
      description: 'En proceso',
    },
    {
      title: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      description: 'Sin iniciar',
    },
    {
      title: 'Completados',
      value: stats.completedThisMonth,
      icon: CheckCircle2,
      description: 'Este mes',
    },
    {
      title: 'Expirados',
      value: stats.expired,
      icon: XCircle,
      description: 'Vencidos',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground">{kpi.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
