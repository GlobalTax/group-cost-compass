import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchPerformanceReviews,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
  fetchLatestPerformanceReview,
} from "@/lib/supabase/repositories/performanceReviews.repo";
import type { Database } from "@/integrations/supabase/types";

type PerformanceReviewInsert = Database["public"]["Tables"]["performance_reviews"]["Insert"];
type PerformanceReviewUpdate = Database["public"]["Tables"]["performance_reviews"]["Update"];

export const usePerformanceReviews = (employeeId?: string) => {
  return useQuery({
    queryKey: ["performance-reviews", employeeId],
    queryFn: () => fetchPerformanceReviews(employeeId),
    staleTime: 30000,
  });
};

export const useLatestPerformanceReview = (employeeId?: string) => {
  return useQuery({
    queryKey: ["latest-performance-review", employeeId],
    queryFn: () => (employeeId ? fetchLatestPerformanceReview(employeeId) : null),
    enabled: !!employeeId,
    staleTime: 30000,
  });
};

export const useCreatePerformanceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (review: PerformanceReviewInsert) => createPerformanceReview(review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["latest-performance-review"] });
      toast.success("Evaluación creada correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al crear evaluación: " + error.message);
    },
  });
};

export const useUpdatePerformanceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: PerformanceReviewUpdate }) =>
      updatePerformanceReview(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["latest-performance-review"] });
      toast.success("Evaluación actualizada correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al actualizar evaluación: " + error.message);
    },
  });
};

export const useDeletePerformanceReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePerformanceReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["performance-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["latest-performance-review"] });
      toast.success("Evaluación eliminada correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al eliminar evaluación: " + error.message);
    },
  });
};
