import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as candidatesRepo from '@/lib/supabase/repositories/candidates.repo';
import type { CandidateFilters, CandidateFormData } from '@/lib/validators/candidateSchema';

export function useCandidates(filters?: CandidateFilters) {
  return useQuery({
    queryKey: ['candidates', filters],
    queryFn: () => candidatesRepo.fetchCandidates(filters),
  });
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: () => candidatesRepo.fetchCandidateById(id),
    enabled: !!id,
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CandidateFormData) => candidatesRepo.createCandidate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidato creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear candidato: ${error.message}`);
    },
  });
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CandidateFormData> }) =>
      candidatesRepo.updateCandidate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.id] });
      toast.success('Candidato actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar candidato: ${error.message}`);
    },
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => candidatesRepo.deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidato eliminado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar candidato: ${error.message}`);
    },
  });
}

export function useUploadCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, candidateId }: { file: File; candidateId: string }) =>
      candidatesRepo.uploadCV(file, candidateId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.candidateId] });
      toast.success('CV subido correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al subir CV: ${error.message}`);
    },
  });
}
