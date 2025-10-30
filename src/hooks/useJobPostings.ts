import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as jobPostingsRepo from '@/lib/supabase/repositories/jobPostings.repo';
import type { JobPostingFilters, JobPostingFormData } from '@/lib/validators/jobPostingSchema';

export function useJobPostings(filters?: JobPostingFilters) {
  return useQuery({
    queryKey: ['job-postings', filters],
    queryFn: () => jobPostingsRepo.fetchJobPostings(filters),
  });
}

export function useJobPosting(id: string) {
  return useQuery({
    queryKey: ['job-posting', id],
    queryFn: () => jobPostingsRepo.fetchJobPostingById(id),
    enabled: !!id,
  });
}

export function useCreateJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JobPostingFormData) => jobPostingsRepo.createJobPosting(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      toast.success('Vacante creada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear vacante: ${error.message}`);
    },
  });
}

export function useUpdateJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<JobPostingFormData> }) =>
      jobPostingsRepo.updateJobPosting(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      queryClient.invalidateQueries({ queryKey: ['job-posting', variables.id] });
      toast.success('Vacante actualizada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar vacante: ${error.message}`);
    },
  });
}

export function usePublishJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobPostingsRepo.publishJobPosting(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      queryClient.invalidateQueries({ queryKey: ['job-posting', id] });
      toast.success('Vacante publicada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al publicar vacante: ${error.message}`);
    },
  });
}

export function useCloseJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobPostingsRepo.closeJobPosting(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      queryClient.invalidateQueries({ queryKey: ['job-posting', id] });
      toast.success('Vacante cerrada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al cerrar vacante: ${error.message}`);
    },
  });
}

export function useDeleteJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobPostingsRepo.deleteJobPosting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      toast.success('Vacante eliminada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar vacante: ${error.message}`);
    },
  });
}

export function useDuplicateJobPosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobPostingsRepo.duplicateJobPosting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
      toast.success('Vacante duplicada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al duplicar vacante: ${error.message}`);
    },
  });
}
