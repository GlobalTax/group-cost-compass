import { useUpdateEmployeeCost, useCreateEmployeeCost } from "./useEmployeeCosts";
import { useQueryClient } from "@tanstack/react-query";

export const useUpdateCostInMatrix = () => {
  const updateCostMutation = useUpdateEmployeeCost();
  const createCostMutation = useCreateEmployeeCost();
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

  const createCostValue = async (
    employeeId: string,
    period: string,
    field: "bruto" | "coste_empresa",
    value: number
  ) => {
    if (value <= 0) {
      throw new Error("El importe debe ser mayor que 0");
    }

    // Normalizar período a formato date (primer día del mes)
    const normalizedPeriod = period.includes('-01') 
      ? period 
      : `${period}-01`;

    const baseCost = {
      employee_id: employeeId,
      period: normalizedPeriod,
      [field]: value,
    };

    // Si es bruto, calcular estimaciones de SS e IRPF
    const costData = field === "bruto" 
      ? {
          ...baseCost,
          ss_empresa: Math.round(value * 0.3 * 100) / 100,
          irpf: Math.round(value * 0.15 * 100) / 100,
          coste_empresa: Math.round(value * 1.3 * 100) / 100,
        }
      : baseCost;

    await createCostMutation.mutateAsync(costData);

    // Invalidar cache de la matriz
    queryClient.invalidateQueries({ queryKey: ["monthly-matrix"] });
  };

  return {
    updateCostValue,
    createCostValue,
    isLoading: updateCostMutation.isPending || createCostMutation.isPending,
  };
};
