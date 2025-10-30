import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  fetchOnboardingDocuments,
  createOnboardingDocument,
  type OnboardingDocument,
} from '@/lib/supabase/repositories/onboarding.repo';

const QUERY_KEY = 'onboarding-documents';

/**
 * Hook para obtener documentos de un onboarding
 */
export function useOnboardingDocuments(onboardingId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, onboardingId],
    queryFn: () => fetchOnboardingDocuments(onboardingId!),
    enabled: !!onboardingId,
    staleTime: 30000,
  });
}

/**
 * Hook para crear documento
 */
export function useCreateOnboardingDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      onboardingId, 
      document 
    }: { 
      onboardingId: string; 
      document: {
        document_name: string;
        pdf_url?: string;
        status?: string;
        requires_signature?: boolean;
      };
    }) => createOnboardingDocument(onboardingId, document),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.onboardingId] });
      toast.success('Documento registrado');
    },
    onError: (error: Error) => {
      toast.error(`Error al registrar documento: ${error.message}`);
    },
  });
}
