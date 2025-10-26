import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchCosts, 
  createCost, 
  bulkCreateCosts,
  type CostsFilters 
} from "@/lib/supabase/repositories/costs.repo";
import type { Database } from "@/integrations/supabase/types";

type CostInsert = Database["public"]["Tables"]["hr_employee_costs"]["Insert"];

// ============================================
// QUERIES
// ============================================

export const useEmployeeCosts = (employeeId?: string, filters?: {
  year?: number;
  companyId?: string;
}) => {
  const costsFilters: CostsFilters = {
    employeeId,
    year: filters?.year,
    companyId: filters?.companyId,
  };

  return useQuery({
    queryKey: ["employee-costs", employeeId, filters],
    queryFn: () => fetchCosts(costsFilters),
    staleTime: 30000, // 30 segundos
    enabled: !!employeeId, // Solo fetch si hay employeeId
  });
};

export const useCostsByPeriod = (filters?: {
  year?: number;
  month?: number;
  companyId?: string;
}) => {
  const costsFilters: CostsFilters = {
    year: filters?.year,
    month: filters?.month,
    companyId: filters?.companyId,
  };

  return useQuery({
    queryKey: ["costs-by-period", filters],
    queryFn: () => fetchCosts(costsFilters),
    staleTime: 30000,
  });
};

// ============================================
// MUTATIONS
// ============================================

export const useCreateEmployeeCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-costs"] });
      queryClient.invalidateQueries({ queryKey: ["costs-by-period"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Coste registrado correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al registrar coste: ${error.message}`);
    },
  });
};

export const useBulkCreateEmployeeCosts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkCreateCosts,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employee-costs"] });
      queryClient.invalidateQueries({ queryKey: ["costs-by-period"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success(`${data.length} costes importados correctamente`);
    },
    onError: (error: Error) => {
      toast.error(`Error al importar costes: ${error.message}`);
    },
  });
};
