import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as pipelineRepo from '@/lib/supabase/repositories/recruitmentPipeline.repo';
import type { PipelineStageFormData, RecruitmentProcessFormData } from '@/lib/validators/recruitmentPipelineSchema';

export function usePipelineStages() {
  return useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: () => pipelineRepo.fetchPipelineStages(),
  });
}

export function useProcessesByStage(stageId: string) {
  return useQuery({
    queryKey: ['processes-by-stage', stageId],
    queryFn: () => pipelineRepo.fetchProcessesByStage(stageId),
    enabled: !!stageId,
  });
}

export function useAllActiveProcesses() {
  return useQuery({
    queryKey: ['active-processes'],
    queryFn: () => pipelineRepo.fetchAllActiveProcesses(),
  });
}

export function useRecruitmentProcess(id: string) {
  return useQuery({
    queryKey: ['recruitment-process', id],
    queryFn: () => pipelineRepo.fetchProcessById(id),
    enabled: !!id,
  });
}

export function useCreatePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PipelineStageFormData) => pipelineRepo.createPipelineStage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] });
      toast.success('Etapa creada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear etapa: ${error.message}`);
    },
  });
}

export function useUpdatePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PipelineStageFormData> }) =>
      pipelineRepo.updatePipelineStage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] });
      toast.success('Etapa actualizada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar etapa: ${error.message}`);
    },
  });
}

export function useDeletePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pipelineRepo.deletePipelineStage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] });
      toast.success('Etapa eliminada correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar etapa: ${error.message}`);
    },
  });
}

export function useCreateRecruitmentProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecruitmentProcessFormData) => pipelineRepo.createRecruitmentProcess(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-processes'] });
      queryClient.invalidateQueries({ queryKey: ['processes-by-stage'] });
      toast.success('Proceso de selección creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear proceso: ${error.message}`);
    },
  });
}

export function useMoveProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ processId, newStageId }: { processId: string; newStageId: string }) =>
      pipelineRepo.moveProcessToStage(processId, newStageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-processes'] });
      queryClient.invalidateQueries({ queryKey: ['processes-by-stage'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-process'] });
      toast.success('Candidato movido a nueva etapa');
    },
    onError: (error: Error) => {
      toast.error(`Error al mover candidato: ${error.message}`);
    },
  });
}

export function useUpdateRecruitmentProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RecruitmentProcessFormData> }) =>
      pipelineRepo.updateRecruitmentProcess(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['active-processes'] });
      queryClient.invalidateQueries({ queryKey: ['recruitment-process', variables.id] });
      toast.success('Proceso actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar proceso: ${error.message}`);
    },
  });
}
