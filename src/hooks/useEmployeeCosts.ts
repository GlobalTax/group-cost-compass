import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type CostInsert = Database["public"]["Tables"]["hr_employee_costs"]["Insert"];

export const useEmployeeCosts = (employeeId?: string, filters?: {
  year?: number;
  companyId?: string;
}) => {
  return useQuery({
    queryKey: ["employee-costs", employeeId, filters],
    queryFn: async () => {
      let query = supabase
        .from("hr_employee_costs")
        .select(`
          *,
          hr_employees (
            id,
            full_name,
            company_id,
            companies (
              id,
              name
            )
          )
        `)
        .order("period", { ascending: false });

      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }

      if (filters?.year) {
        const startDate = `${filters.year}-01-01`;
        const endDate = `${filters.year}-12-31`;
        query = query.gte("period", startDate).lte("period", endDate);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCostsByPeriod = (filters?: {
  year?: number;
  month?: number;
  companyId?: string;
}) => {
  return useQuery({
    queryKey: ["costs-by-period", filters],
    queryFn: async () => {
      let query = supabase
        .from("hr_employee_costs")
        .select(`
          *,
          hr_employees (
            id,
            full_name,
            company_id,
            companies (
              id,
              name
            )
          )
        `)
        .order("period", { ascending: false });

      if (filters?.year) {
        const startDate = `${filters.year}-01-01`;
        const endDate = `${filters.year}-12-31`;
        query = query.gte("period", startDate).lte("period", endDate);
      }

      if (filters?.month && filters?.year) {
        const period = `${filters.year}-${String(filters.month).padStart(2, "0")}-01`;
        query = query.eq("period", period);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateEmployeeCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CostInsert) => {
      const { data: cost, error } = await supabase
        .from("hr_employee_costs")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return cost;
    },
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
    mutationFn: async (costs: CostInsert[]) => {
      const { data, error } = await supabase
        .from("hr_employee_costs")
        .insert(costs)
        .select();

      if (error) throw error;
      return data;
    },
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
