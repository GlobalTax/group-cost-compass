import { useQuery } from "@tanstack/react-query";
import { calculateCostsEvolution } from "@/services/analytics/costsEvolutionService";

interface CostsEvolutionFilters {
  month: string;
  companyId?: string;
}

export interface CostsEvolutionDataPoint {
  month: string;
  bruto: number;
  coste: number;
  employees: number;
}

export const useCostsEvolution = (filters: CostsEvolutionFilters) => {
  return useQuery({
    queryKey: ["costs-evolution", filters.month, filters.companyId],
    queryFn: () => calculateCostsEvolution(filters),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
