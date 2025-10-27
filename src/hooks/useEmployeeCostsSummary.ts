import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

interface EmployeeCostsSummaryFilters {
  year?: number;
  companyId?: string;
}

// Estructura real de vw_employee_annual
interface EmployeeAnnualCost {
  employee_id: string;
  full_name: string;
  company: string;
  company_id: string;
  bruto_anual: number;
  coste_anual: number;
  year: number;
  org_id: string;
}

/**
 * Hook optimizado que usa la vista vw_employee_annual
 * Elimina cálculos del frontend, delegando a PostgreSQL
 */
export const useEmployeeCostsSummary = (filters?: EmployeeCostsSummaryFilters) => {
  const currentYear = filters?.year || new Date().getFullYear();

  return useQuery({
    queryKey: ["employee-annual-costs", currentYear, filters?.companyId],
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
        console.error("Error fetching employee annual costs:", error);
        throw error;
      }

      return data as EmployeeAnnualCost[];
    },
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: false,
  });
};
