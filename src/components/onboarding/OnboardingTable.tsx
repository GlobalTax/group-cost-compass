import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Eye, Mail, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/formatters';
import type { OnboardingRecord } from '@/lib/supabase/repositories/onboarding.repo';

interface OnboardingTableProps {
  onboardings: OnboardingRecord[];
  onViewDetail: (onboarding: OnboardingRecord) => void;
  onResendInvitation: (onboarding: OnboardingRecord) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  pending: { label: 'Pendiente', variant: 'secondary' as const },
  in_progress: { label: 'En Progreso', variant: 'default' as const },
  completed: { label: 'Completado', variant: 'default' as const },
  expired: { label: 'Expirado', variant: 'destructive' as const },
};

export function OnboardingTable({
  onboardings,
  onViewDetail,
  onResendInvitation,
  onDelete,
}: OnboardingTableProps) {
  const calculateProgress = (step: number) => {
    return Math.round((step / 7) * 100);
  };

  if (onboardings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay procesos de onboarding</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidato</TableHead>
            <TableHead>Puesto</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Progreso</TableHead>
            <TableHead>Fecha Creación</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {onboardings.map((onboarding) => {
            const config = statusConfig[onboarding.status];
            const progress = calculateProgress(onboarding.current_step);

            return (
              <TableRow key={onboarding.id}>
                <TableCell className="font-medium">{onboarding.email}</TableCell>
                <TableCell>{onboarding.position_title}</TableCell>
                <TableCell>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="w-20" />
                    <span className="text-xs text-muted-foreground">{progress}%</span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(onboarding.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetail(onboarding)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {onboarding.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onResendInvitation(onboarding)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(onboarding.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
