import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createProjectedBonus } from "@/lib/supabase/repositories/compensation.repo";

export const useCreateProjectedBonus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createProjectedBonus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonus-payments"] });
      toast.success("Proyección guardada correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al guardar proyección: ${error.message}`);
    },
  });
};
