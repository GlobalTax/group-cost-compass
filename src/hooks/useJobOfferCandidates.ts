import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as jobOfferCandidatesRepo from '@/lib/supabase/repositories/jobOfferCandidates.repo';

export function useJobOfferCandidates(jobOfferId: string) {
  return useQuery({
    queryKey: ['job-offer-candidates', jobOfferId],
    queryFn: () => jobOfferCandidatesRepo.fetchJobOfferCandidates(jobOfferId),
    enabled: !!jobOfferId,
  });
}

export function useAssociateCandidates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobOfferId, candidateIds }: { jobOfferId: string; candidateIds: string[] }) =>
      jobOfferCandidatesRepo.associateCandidates(jobOfferId, candidateIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-offer-candidates', variables.jobOfferId] });
      queryClient.invalidateQueries({ queryKey: ['job-offers'] });
      toast.success('Candidatos asociados correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al asociar candidatos: ${error.message}`);
    },
  });
}

export function useRemoveJobOfferCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobOfferCandidatesRepo.removeJobOfferCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-offer-candidates'] });
      queryClient.invalidateQueries({ queryKey: ['job-offers'] });
      toast.success('Candidato desvinculado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useUpdateJobOfferCandidateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, additionalData }: { id: string; status: string; additionalData?: any }) =>
      jobOfferCandidatesRepo.updateJobOfferCandidateStatus(id, status, additionalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-offer-candidates'] });
      toast.success('Estado actualizado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

export function useUploadCandidatePDF() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, jobOfferCandidateId }: { file: File; jobOfferCandidateId: string }) =>
      jobOfferCandidatesRepo.uploadCandidatePDF(file, jobOfferCandidateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-offer-candidates'] });
      toast.success('PDF subido correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al subir PDF: ${error.message}`);
    },
  });
}
