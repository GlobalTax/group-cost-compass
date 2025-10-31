import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchCompensationBands,
  fetchCompensationBandsByDepartment,
  createCompensationBand,
  updateCompensationBand,
  deleteCompensationBand,
  getRecommendedBandForLevel,
} from "@/lib/supabase/repositories/compensation.repo";
import type { Database } from "@/integrations/supabase/types";

type CompensationBandInsert = Database["public"]["Tables"]["compensation_bands"]["Insert"];
type CompensationBandUpdate = Database["public"]["Tables"]["compensation_bands"]["Update"];

export const useCompensationBands = () => {
  return useQuery({
    queryKey: ["compensation-bands"],
    queryFn: fetchCompensationBands,
    staleTime: 60000,
  });
};

export const useCompensationBandsByDepartment = (department?: string) => {
  return useQuery({
    queryKey: ["compensation-bands", department],
    queryFn: () => fetchCompensationBandsByDepartment(department),
    staleTime: 60000,
  });
};

export const useRecommendedBand = (level?: string) => {
  return useQuery({
    queryKey: ["recommended-band", level],
    queryFn: () => (level ? getRecommendedBandForLevel(level) : null),
    enabled: !!level,
    staleTime: 60000,
  });
};

export const useCreateCompensationBand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (band: CompensationBandInsert) => createCompensationBand(band),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compensation-bands"] });
      toast.success("Banda salarial creada correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al crear banda salarial: " + error.message);
    },
  });
};

export const useUpdateCompensationBand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: CompensationBandUpdate }) =>
      updateCompensationBand(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compensation-bands"] });
      toast.success("Banda salarial actualizada correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al actualizar banda salarial: " + error.message);
    },
  });
};

export const useDeleteCompensationBand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCompensationBand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compensation-bands"] });
      toast.success("Banda salarial eliminada correctamente");
    },
    onError: (error: Error) => {
      toast.error("Error al eliminar banda salarial: " + error.message);
    },
  });
};
