import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  fetchCosts, 
  createCost, 
  bulkCreateCosts,
  updateCost,
  upsertCost,
  bulkUpsertCosts,
  type CostsFilters 
} from "@/lib/supabase/repositories/costs.repo";
import type { Database } from "@/integrations/supabase/types";

type CostInsert = Database["public"]["Tables"]["hr_employee_costs"]["Insert"];

// ============================================
// QUERIES
// ============================================

/**
 * Hook para consultar costes de empleado(s) con filtros
 * 
 * @param {string} [employeeId] - ID de empleado específico (undefined = todos)
 * @param {Object} [filters] - Filtros adicionales
 * @param {number} [filters.year] - Año a filtrar
 * @param {string} [filters.companyId] - ID de empresa
 * 
 * @returns {UseQueryResult} Query result con costes filtrados
 * 
 * @example
 * // Costes de un empleado en 2025
 * const { data: costs } = useEmployeeCosts("uuid-empleado", { year: 2025 });
 * 
 * @example
 * // Todos los costes de una empresa
 * const { data } = useEmployeeCosts(undefined, { companyId: "uuid-empresa" });
 * 
 * @remarks
 * - Cache: 30s (costes pueden actualizarse frecuentemente)
 * - Incluye relación: hr_employees
 * 
 * @see {@link src/lib/supabase/repositories/costs.repo.ts}
 */
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
    staleTime: 30000,
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

export const useUpdateEmployeeCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CostInsert> }) => 
      updateCost(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-costs"] });
      queryClient.invalidateQueries({ queryKey: ["costs-by-period"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Coste actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar coste: ${error.message}`);
    },
  });
};

/**
 * Upsert (create or update) employee cost
 * Usado en entrada manual de nóminas
 */
export const useUpsertEmployeeCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertCost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-costs"] });
      queryClient.invalidateQueries({ queryKey: ["costs-by-period"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Guardado");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

/**
 * Bulk upsert employee costs
 */
export const useBulkUpsertEmployeeCosts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUpsertCosts,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employee-costs"] });
      queryClient.invalidateQueries({ queryKey: ["costs-by-period"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success(`${data.length} costes guardados correctamente`);
    },
    onError: (error: Error) => {
      toast.error(`Error al guardar costes: ${error.message}`);
    },
  });
};
