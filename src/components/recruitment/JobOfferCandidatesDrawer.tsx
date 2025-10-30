import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useJobOfferCandidates, useRemoveJobOfferCandidate, useUpdateJobOfferCandidateStatus } from '@/hooks/useJobOfferCandidates';
import { Mail, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDate } from '@/lib/formatters';

interface JobOfferCandidatesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobOfferId: string;
  jobOfferTitle: string;
}

const statusConfig = {
  pending: { label: 'Pendiente', variant: 'secondary' as const, icon: Clock },
  sent: { label: 'Enviada', variant: 'default' as const, icon: Mail },
  accepted: { label: 'Aceptada', variant: 'success' as const, icon: CheckCircle2 },
  rejected: { label: 'Rechazada', variant: 'destructive' as const, icon: XCircle },
};

export function JobOfferCandidatesDrawer({
  open,
  onOpenChange,
  jobOfferId,
  jobOfferTitle,
}: JobOfferCandidatesDrawerProps) {
  const { data: candidates, isLoading } = useJobOfferCandidates(jobOfferId);
  const removeMutation = useRemoveJobOfferCandidate();
  const updateStatusMutation = useUpdateJobOfferCandidateStatus();

  const handleRemove = async (id: string) => {
    if (!confirm('¿Desvincular este candidato de la oferta?')) return;
    await removeMutation.mutateAsync(id);
  };

  const handleSend = async (id: string) => {
    await updateStatusMutation.mutateAsync({ id, status: 'sent' });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Candidatos Asociados: {jobOfferTitle}</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-6">
          {isLoading && <p className="text-sm text-muted-foreground">Cargando...</p>}

          {!isLoading && candidates?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay candidatos asociados a esta oferta
            </p>
          )}

          <div className="space-y-4">
            {candidates?.map((item) => {
              const StatusIcon = statusConfig[item.status as keyof typeof statusConfig]?.icon || Clock;
              
              return (
                <div key={item.id} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">
                          {item.candidate?.first_name} {item.candidate?.last_name}
                        </h4>
                        <Badge variant={statusConfig[item.status as keyof typeof statusConfig]?.variant}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig[item.status as keyof typeof statusConfig]?.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.candidate?.email}</p>
                      {item.candidate?.phone && (
                        <p className="text-sm text-muted-foreground">{item.candidate.phone}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {item.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleSend(item.id)}
                          disabled={updateStatusMutation.isPending}
                        >
                          <Mail className="mr-1 h-4 w-4" />
                          Enviar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemove(item.id)}
                        disabled={removeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {item.sent_at && (
                      <div>
                        <span className="text-muted-foreground">Enviada:</span>
                        <p className="font-medium">{formatDate(item.sent_at)}</p>
                      </div>
                    )}
                    {item.accepted_at && (
                      <div>
                        <span className="text-muted-foreground">Aceptada:</span>
                        <p className="font-medium">{formatDate(item.accepted_at)}</p>
                      </div>
                    )}
                    {item.rejected_at && (
                      <div>
                        <span className="text-muted-foreground">Rechazada:</span>
                        <p className="font-medium">{formatDate(item.rejected_at)}</p>
                      </div>
                    )}
                  </div>

                  {item.rejection_reason && (
                    <div className="mt-3 rounded bg-destructive/10 p-2">
                      <p className="text-xs text-destructive">
                        <strong>Motivo:</strong> {item.rejection_reason}
                      </p>
                    </div>
                  )}

                  {item.pdf_url && (
                    <div className="mt-3">
                      <Button size="sm" variant="outline" asChild>
                        <a href={item.pdf_url} target="_blank" rel="noopener noreferrer">
                          Ver PDF
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
