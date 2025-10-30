import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, FileText, CheckCircle, XCircle } from 'lucide-react';
import type { JobOffer } from '@/lib/supabase/repositories/jobOffers.repo';
import { JobOfferDetailDrawer } from './JobOfferDetailDrawer';

interface JobOffersTableProps {
  jobOffers: JobOffer[];
}

const statusConfig = {
  draft: { label: 'Borrador', variant: 'secondary' as const },
  sent: { label: 'Enviada', variant: 'default' as const },
  accepted: { label: 'Aceptada', variant: 'success' as const },
  rejected: { label: 'Rechazada', variant: 'destructive' as const },
  expired: { label: 'Expirada', variant: 'outline' as const },
};

export function JobOffersTable({ jobOffers }: JobOffersTableProps) {
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  if (jobOffers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No hay ofertas registradas
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Puesto</TableHead>
              <TableHead>Candidato</TableHead>
              <TableHead>Salario</TableHead>
              <TableHead>Tipo Contrato</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobOffers.map((offer) => {
              const statusInfo = statusConfig[offer.status] || {
                label: offer.status || 'Desconocido',
                variant: 'outline' as const
              };
              const candidateName = offer.candidate
                ? `${offer.candidate.first_name} ${offer.candidate.last_name}`
                : 'Sin candidato';

              return (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.title}</TableCell>
                  <TableCell>{candidateName}</TableCell>
                  <TableCell>
                    {offer.salary_amount ? `${offer.salary_amount.toLocaleString('es-ES')} ${offer.salary_currency}` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{offer.position_level || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(offer.created_at).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOfferId(offer.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Ver documentos"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedOfferId && (
        <JobOfferDetailDrawer
          open={!!selectedOfferId}
          onOpenChange={(open) => !open && setSelectedOfferId(null)}
          offerId={selectedOfferId}
        />
      )}
    </>
  );
}
