import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchOnboardingByToken,
  updateOnboardingStep,
} from '@/lib/supabase/repositories/onboarding.repo';

const QUERY_KEY = 'onboarding-by-token';

/**
 * Hook para obtener onboarding por token (acceso público)
 */
export function useOnboardingByToken(token: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, token],
    queryFn: () => fetchOnboardingByToken(token!),
    enabled: !!token,
    staleTime: 10000,
    retry: 1,
  });
}

/**
 * Hook para actualizar paso del onboarding (público)
 */
export function useUpdateOnboardingStepByToken() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      id, 
      step, 
      stepData 
    }: { 
      id: string; 
      step: number; 
      stepData: Record<string, any>;
    }) => updateOnboardingStep(id, step, stepData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['onboardings'] });
    },
    onError: (error: Error) => {
      toast.error(`Error al guardar: ${error.message}`);
    },
  });
}
