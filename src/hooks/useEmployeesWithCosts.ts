import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

interface EmployeeWithCostsFilters {
  year?: number;
  companyId?: string;
  searchTerm?: string;
  activeOnly?: boolean;
}

export interface EmployeeWithCosts {
  employee_id: string;
  full_name: string;
  company: string;
  company_id: string;
  position?: string;
  termination_date?: string;
  
  // Datos de costes (pueden ser null si no hay registros)
  salario_base_anual: number | null;
  bruto_cobrado_anual: number | null;
  coste_ss_anual: number | null;
  bonus_pagado_anual: number | null;
  coste_total_anual: number | null;
}

export const useEmployeesWithCosts = (filters?: EmployeeWithCostsFilters) => {
  const currentYear = filters?.year || new Date().getFullYear();

  return useQuery({
    queryKey: ["employees-with-costs", currentYear, filters],
    queryFn: async () => {
      // Query base: todos los empleados
      let employeesQuery = supabase
        .from("hr_employees")
        .select(`
          id,
          full_name,
          position,
          termination_date,
          annual_salary,
          company_id,
          companies!inner (
            id,
            name
          )
        `)
        .order("full_name");

      // Aplicar filtros de hr_employees
      if (filters?.companyId && filters.companyId !== "all") {
        employeesQuery = employeesQuery.eq("company_id", filters.companyId);
      }

      if (filters?.searchTerm) {
        employeesQuery = employeesQuery.ilike("full_name", `%${filters.searchTerm}%`);
      }

      if (filters?.activeOnly === true) {
        employeesQuery = employeesQuery.is("termination_date", null);
      } else if (filters?.activeOnly === false) {
        employeesQuery = employeesQuery.not("termination_date", "is", null);
      }

      const { data: employees, error: employeesError } = await employeesQuery;

      if (employeesError) {
        console.error("Error fetching employees:", employeesError);
        throw employeesError;
      }

      // Query de costes anuales
      let costsQuery = supabase
        .from("vw_employee_annual")
        .select("*")
        .eq("year", currentYear);

      if (filters?.companyId && filters.companyId !== "all") {
        costsQuery = costsQuery.eq("company_id", filters.companyId);
      }

      const { data: costs, error: costsError } = await costsQuery;

      if (costsError) {
        console.error("Error fetching costs:", costsError);
        throw costsError;
      }

      // Crear mapa de costes por employee_id
      const costsMap = new Map(
        costs?.map(cost => [cost.employee_id, cost]) || []
      );

      // Combinar empleados con costes (LEFT JOIN en frontend)
      const result: EmployeeWithCosts[] = employees.map(emp => {
        const cost = costsMap.get(emp.id);
        
        return {
          employee_id: emp.id,
          full_name: emp.full_name,
          company: emp.companies?.name || "—",
          company_id: emp.company_id,
          position: emp.position,
          termination_date: emp.termination_date,
          
          // Si hay costes, usar valores reales; si no, null
          salario_base_anual: emp.annual_salary,
          bruto_cobrado_anual: cost?.bruto_cobrado_anual || null,
          coste_ss_anual: cost?.coste_ss_anual || null,
          bonus_pagado_anual: cost?.bonus_pagado_anual || null,
          coste_total_anual: cost?.coste_total_anual || null,
        };
      });

      return result;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
