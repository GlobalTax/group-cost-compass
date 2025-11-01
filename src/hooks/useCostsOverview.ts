import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

interface CostsOverviewFilters {
  year?: number;
  companyId?: string;
  activeOnly?: boolean;
}

export interface EmployeeAnnualCost {
  employee_id: string;
  full_name: string;
  company: string;
  company_id: string;
  year: number;
  org_id: string;
  salario_base_anual: number | null;
  bruto_cobrado_anual: number;
  coste_ss_anual: number;
  bonus_pagado_anual: number;
  coste_total_anual: number;
  department_id: string | null;
  department_name: string | null;
  department_color: string | null;
  team_id: string | null;
  team_name: string | null;
}

/**
 * Hook para obtener vista consolidada de costes de plantilla
 * Usa vw_employee_annual con cálculo correcto de SS empresa
 */
export const useCostsOverview = (filters?: CostsOverviewFilters) => {
  const currentYear = filters?.year || new Date().getFullYear();

  return useQuery({
    queryKey: ["costs-overview", currentYear, filters?.companyId],
    queryFn: async () => {
      let query = supabase
        .from("vw_employee_annual")
        .select("*")
        .eq("year", currentYear)
        .order("full_name");

      if (filters?.companyId && filters.companyId !== "all") {
        query = query.eq("company_id", filters.companyId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching costs overview:", error);
        throw error;
      }

      return (data || []) as EmployeeAnnualCost[];
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
