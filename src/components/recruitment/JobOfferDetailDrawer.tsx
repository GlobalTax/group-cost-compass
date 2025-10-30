import { useState } from 'react';
import { useJobOffer, useSendJobOffer, useAcceptJobOffer, useRejectJobOffer, useUploadOfferPDF } from '@/hooks/useJobOffers';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  DollarSign, 
  Calendar, 
  Briefcase, 
  FileText, 
  Upload,
  Send,
  CheckCircle,
  XCircle,
  User,
  MapPin
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface JobOfferDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offerId: string;
}

const statusConfig = {
  draft: { label: 'Borrador', variant: 'secondary' as const },
  sent: { label: 'Enviada', variant: 'default' as const },
  accepted: { label: 'Aceptada', variant: 'success' as const },
  rejected: { label: 'Rechazada', variant: 'destructive' as const },
  expired: { label: 'Expirada', variant: 'outline' as const },
};

export function JobOfferDetailDrawer({ open, onOpenChange, offerId }: JobOfferDetailDrawerProps) {
  const { data: offer, isLoading } = useJobOffer(offerId);
  const sendOffer = useSendJobOffer();
  const acceptOffer = useAcceptJobOffer();
  const rejectOffer = useRejectJobOffer();
  const uploadPDF = useUploadOfferPDF();

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSend = async () => {
    try {
      await sendOffer.mutateAsync(offerId);
    } catch (error) {
      console.error('Error sending offer:', error);
    }
  };

  const handleAccept = async () => {
    try {
      await acceptOffer.mutateAsync(offerId);
    } catch (error) {
      console.error('Error accepting offer:', error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectOffer.mutateAsync({ id: offerId, reason: rejectionReason });
      setShowRejectDialog(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting offer:', error);
    }
  };

  const handleFileUpload = async (type: 'offer' | 'signed') => {
    if (!selectedFile) return;
    try {
      await uploadPDF.mutateAsync({ file: selectedFile, offerId, type });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading PDF:', error);
    }
  };

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

  if (!offer) return null;

  const statusInfo = statusConfig[offer.status];

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center justify-between">
              <span>{offer.title}</span>
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </DrawerTitle>
          </DrawerHeader>

          <div className="p-6 overflow-y-auto space-y-6">
            {/* Candidatos Asociados */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Candidatos</h3>
              <p className="text-sm text-muted-foreground">
                {offer.candidates_count || 0} candidato(s) asociado(s)
              </p>
            </div>

            {/* Detalles del Puesto */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Detalles del Puesto</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {offer.department && (
                  <div>
                    <span className="text-muted-foreground">Departamento:</span>
                    <p className="font-medium">{offer.department}</p>
                  </div>
                )}
                {offer.work_location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{offer.work_location}</span>
                  </div>
                )}
                {offer.position_level && (
                  <div>
                    <span className="text-muted-foreground">Nivel:</span>
                    <p className="font-medium">{offer.position_level}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Retribución */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Retribución</h3>
              <div className="space-y-2 text-sm">
                {offer.salary_base && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {offer.salary_base.toLocaleString('es-ES')} {offer.salary_currency} (base anual)
                    </span>
                  </div>
                )}
                {offer.bonus_amount && (
                  <div className="ml-6">
                    Bonus: {offer.bonus_amount.toLocaleString('es-ES')} {offer.salary_currency}
                  </div>
                )}
                {offer.exclusivity_percentage && (
                  <div className="ml-6">Exclusividad: {offer.exclusivity_percentage}%</div>
                )}
                {offer.work_schedule && (
                  <div className="ml-6">Horario: {offer.work_schedule}</div>
                )}
              </div>
            </div>

            {/* Fechas */}
            {offer.start_date && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Fecha de Inicio</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(offer.start_date).toLocaleDateString('es-ES')}</span>
                </div>
              </div>
            )}

            {/* Notas */}
            {offer.additional_notes && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Notas Adicionales</h3>
                <p className="text-sm text-muted-foreground">{offer.additional_notes}</p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex flex-wrap gap-2 pt-4">
              {offer.status === 'draft' && (
                <Button onClick={handleSend} disabled={sendOffer.isPending}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Oferta
                </Button>
              )}
              {offer.status === 'sent' && (
                <>
                  <Button onClick={handleAccept} disabled={acceptOffer.isPending}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aceptar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowRejectDialog(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                </>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rechazar Oferta</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas rechazar esta oferta? Opcionalmente, proporciona un motivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Motivo del rechazo (opcional)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject}>
              Confirmar Rechazo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
