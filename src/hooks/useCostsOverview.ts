import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

interface CostsOverviewFilters {
  month?: string; // Formato YYYY-MM
  companyId?: string;
  activeOnly?: boolean;
}

export interface EmployeeAnnualCost {
  employee_id: string;
  full_name: string;
  hire_date: string | null;
  termination_date: string | null;
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
 * Hook para obtener vista consolidada de costes mensuales de plantilla
 * Consulta hr_employee_costs con join a hr_employees para obtener datos mensuales
 */
export const useCostsOverview = (filters?: CostsOverviewFilters) => {
  const currentMonth = filters?.month || new Date().toISOString().slice(0, 7);

  return useQuery({
    queryKey: ["costs-overview", currentMonth, filters?.companyId],
    queryFn: async () => {
      let query = supabase
        .from("hr_employee_costs")
        .select(`
          *,
          hr_employees!inner (
            id,
            full_name,
            hire_date,
            termination_date,
            company_id,
            org_id,
            companies!inner (
              name
            ),
            departments (
              id,
              name,
              color
            ),
            teams (
              id,
              name
            )
          )
        `)
        .eq("period", currentMonth)
        .order("hr_employees(full_name)");

      if (filters?.companyId && filters.companyId !== "all") {
        query = query.eq("hr_employees.company_id", filters.companyId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching costs overview:", error);
        throw error;
      }

      // Transformar datos al formato esperado
      return (data || []).map((cost: any) => ({
        employee_id: cost.employee_id,
        full_name: cost.hr_employees.full_name,
        hire_date: cost.hr_employees.hire_date,
        termination_date: cost.hr_employees.termination_date,
        company: cost.hr_employees.companies.name,
        company_id: cost.hr_employees.company_id,
        year: new Date(cost.period).getFullYear(),
        org_id: cost.hr_employees.org_id,
        salario_base_anual: cost.bruto || 0,
        bruto_cobrado_anual: cost.bruto || 0,
        coste_ss_anual: cost.coste_ss || 0,
        bonus_pagado_anual: cost.bonus_pagado || 0,
        coste_total_anual: cost.coste_empresa || 0,
        department_id: cost.hr_employees.departments?.id || null,
        department_name: cost.hr_employees.departments?.name || null,
        department_color: cost.hr_employees.departments?.color || null,
        team_id: cost.hr_employees.teams?.id || null,
        team_name: cost.hr_employees.teams?.name || null,
      })) as EmployeeAnnualCost[];
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
