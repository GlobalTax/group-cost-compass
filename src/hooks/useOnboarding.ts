import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchOnboardings,
  fetchOnboardingById,
  createOnboarding,
  updateOnboarding,
  deleteOnboarding,
  completeOnboarding,
  fetchOnboardingStats,
  type OnboardingRecord,
} from '@/lib/supabase/repositories/onboarding.repo';
import type { CreateOnboarding, UpdateOnboarding, OnboardingFilters } from '@/lib/validators/onboardingSchema';

const QUERY_KEY = 'onboardings';

/**
 * Hook para obtener lista de onboardings
 */
export function useOnboardings(filters?: OnboardingFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () => fetchOnboardings(filters),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook para obtener un onboarding específico
 */
export function useOnboarding(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => fetchOnboardingById(id!),
    enabled: !!id,
    staleTime: 30000,
  });
}

/**
 * Hook para obtener estadísticas
 */
export function useOnboardingStats() {
  return useQuery({
    queryKey: [QUERY_KEY, 'stats'],
    queryFn: fetchOnboardingStats,
    staleTime: 60000,
  });
}

/**
 * Hook para crear onboarding
 */
export function useCreateOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOnboarding) => createOnboarding(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Proceso de onboarding iniciado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear onboarding: ${error.message}`);
    },
  });
}

/**
 * Hook para actualizar onboarding
 */
export function useUpdateOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateOnboarding }) =>
      updateOnboarding(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.id] });
      toast.success('Onboarding actualizado');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    },
  });
}

/**
 * Hook para completar onboarding
 */
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => completeOnboarding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Onboarding completado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
}

/**
 * Hook para eliminar onboarding
 */
export function useDeleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOnboarding(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Onboarding eliminado');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    },
  });
}
