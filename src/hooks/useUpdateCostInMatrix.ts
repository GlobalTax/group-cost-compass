import { useUpdateEmployeeCost } from "./useEmployeeCosts";
import { useQueryClient } from "@tanstack/react-query";

export const useUpdateCostInMatrix = () => {
  const updateCostMutation = useUpdateEmployeeCost();
  const queryClient = useQueryClient();

  const updateCostValue = async (
    costId: string,
    field: "bruto" | "coste_empresa",
    newValue: number
  ) => {
    await updateCostMutation.mutateAsync({
      id: costId,
      updates: { [field]: newValue },
    });

    // Invalidar cache de la matriz
    queryClient.invalidateQueries({ queryKey: ["monthly-matrix"] });
  };

  return {
    updateCostValue,
    isLoading: updateCostMutation.isPending,
  };
};
