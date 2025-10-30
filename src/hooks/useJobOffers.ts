import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as jobOffersRepo from '@/lib/supabase/repositories/jobOffers.repo';
import type { JobOfferFormData, JobOfferFilters } from '@/lib/validators/jobOfferSchema';

export function useJobOffers(filters?: JobOfferFilters) {
  return useQuery({
    queryKey: ['job-offers', filters],
    queryFn: () => jobOffersRepo.fetchJobOffers(filters),
  });
}

export function useJobOffer(id: string) {
  return useQuery({
    queryKey: ['job-offer', id],
    queryFn: () => jobOffersRepo.fetchJobOfferById(id),
    enabled: !!id,
  });
}

export function useCreateJobOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JobOfferFormData) => jobOffersRepo.createJobOffer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-offers'] });
      toast.success('Oferta creada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear oferta: ${error.message}`);
    },
  });
}

export function useUpdateJobOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JobOfferFormData> }) =>
      jobOffersRepo.updateJobOffer(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-offers'] });
      queryClient.invalidateQueries({ queryKey: ['job-offer', variables.id] });
      toast.success('Oferta actualizada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar oferta: ${error.message}`);
    },
  });
}

export function useSendJobOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobOffersRepo.sendJobOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-offers'] });
      toast.success('Oferta enviada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al enviar oferta: ${error.message}`);
    },
  });
}

// Note: Accept/Reject actions now happen at job_offer_candidates level
// Use useJobOfferCandidates hooks instead

export function useDeleteJobOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobOffersRepo.deleteJobOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-offers'] });
      toast.success('Oferta eliminada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar oferta: ${error.message}`);
    },
  });
}

export function useUploadOfferPDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, offerId, type }: { file: File; offerId: string; type: 'offer' | 'signed' }) =>
      jobOffersRepo.uploadOfferPDF(file, offerId, type),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-offer', variables.offerId] });
      toast.success('PDF subido correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al subir PDF: ${error.message}`);
    },
  });
}
