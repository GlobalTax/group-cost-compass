import { useRecruitmentProcess } from '@/hooks/useRecruitmentPipeline';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Calendar, DollarSign, User } from 'lucide-react';

interface ProcessDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processId: string;
}

export function ProcessDetailDrawer({ open, onOpenChange, processId }: ProcessDetailDrawerProps) {
  const { data: process, isLoading } = useRecruitmentProcess(processId);

  if (isLoading) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <Skeleton className="h-8 w-64" />
          </DrawerHeader>
          <div className="p-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  if (!process) return null;

  const candidateName = process.candidate
    ? `${process.candidate.first_name} ${process.candidate.last_name}`
    : 'Sin candidato';

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{process.position_title}</DrawerTitle>
        </DrawerHeader>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Candidato */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Candidato</h3>
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{candidateName}</span>
            </div>
            {process.candidate?.email && (
              <div className="text-sm text-muted-foreground ml-6">
                {process.candidate.email}
              </div>
            )}
          </div>

          {/* Estado */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Estado</h3>
            <div className="flex gap-2">
              <Badge variant="default">{process.status}</Badge>
              {process.priority && (
                <Badge
                  variant={
                    process.priority === 'high'
                      ? 'destructive'
                      : process.priority === 'medium'
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {process.priority}
                </Badge>
              )}
            </div>
          </div>

          {/* Etapa Actual */}
          {process.stage && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Etapa Actual</h3>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: process.stage.color || '#6366f1' }}
                />
                <span className="text-sm">{process.stage.name}</span>
              </div>
            </div>
          )}

          {/* Vacante */}
          {process.job_posting && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Vacante</h3>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{process.job_posting.title}</span>
              </div>
            </div>
          )}

          {/* Departamento */}
          {process.department && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Departamento</h3>
              <p className="text-sm">{process.department}</p>
            </div>
          )}

          {/* Presupuesto */}
          {(process.budget_min || process.budget_max) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Presupuesto</h3>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>
                  {process.budget_min?.toLocaleString('es-ES')} -{' '}
                  {process.budget_max?.toLocaleString('es-ES')} EUR
                </span>
              </div>
            </div>
          )}

          {/* Fecha Objetivo */}
          {process.target_start_date && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Fecha Objetivo de Inicio</h3>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{new Date(process.target_start_date).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          )}

          {/* Notas */}
          {process.notes && (
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Notas</h3>
              <p className="text-sm text-muted-foreground">{process.notes}</p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
