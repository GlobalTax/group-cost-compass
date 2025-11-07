import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { format } from "date-fns";

interface MonthlyMovementsFilters {
  month: string;       // "YYYY-MM" (ej: "2025-03")
  companyId?: string;  // undefined = todas las empresas
}

export interface EmployeeMovement {
  id: string;
  full_name: string;
  dni: string;
  company_name: string;
  company_id: string;
  movement_type: "hire" | "termination";
  movement_date: string;
  employment_status: string;
  termination_reason?: string | null;
  department?: string | null;
  position?: string | null;
}

export interface MonthlyMovementsData {
  hires: EmployeeMovement[];
  terminations: EmployeeMovement[];
  totalHires: number;
  totalTerminations: number;
  netChange: number;
}

export const useMonthlyMovements = (filters: MonthlyMovementsFilters) => {
  return useQuery({
    queryKey: ["monthly-movements", filters.month, filters.companyId],
    queryFn: async () => {
      // Parsear mes
      const [year, month] = filters.month.split("-").map(Number);
      const startDate = format(new Date(year, month - 1, 1), "yyyy-MM-dd");
      const endDate = format(new Date(year, month, 0), "yyyy-MM-dd");

      // Query base
      let query = supabase
        .from("hr_employees")
        .select(`
          id,
          full_name,
          dni,
          company_id,
          hire_date,
          termination_date,
          termination_reason,
          employment_status,
          department_id,
          position,
          companies!inner(name),
          departments(name)
        `);

      // Filtrar por empresa si es necesario
      if (filters.companyId && filters.companyId !== "all") {
        query = query.eq("company_id", filters.companyId);
      }

      const { data: employees, error } = await query;
      if (error) throw error;

      // Separar altas y bajas del mes
      const hires: EmployeeMovement[] = [];
      const terminations: EmployeeMovement[] = [];

      employees?.forEach((emp: any) => {
        // Verificar si es alta del mes
        if (emp.hire_date && emp.hire_date >= startDate && emp.hire_date <= endDate) {
          hires.push({
            id: emp.id,
            full_name: emp.full_name,
            dni: emp.dni,
            company_name: emp.companies.name,
            company_id: emp.company_id,
            movement_type: "hire",
            movement_date: emp.hire_date,
            employment_status: emp.employment_status,
            department: emp.departments?.name || null,
            position: emp.position || null,
          });
        }

        // Verificar si es baja del mes
        if (emp.termination_date && emp.termination_date >= startDate && emp.termination_date <= endDate) {
          terminations.push({
            id: emp.id,
            full_name: emp.full_name,
            dni: emp.dni,
            company_name: emp.companies.name,
            company_id: emp.company_id,
            movement_type: "termination",
            movement_date: emp.termination_date,
            employment_status: emp.employment_status,
            termination_reason: emp.termination_reason,
            department: emp.departments?.name || null,
            position: emp.position || null,
          });
        }
      });

      // Ordenar por fecha
      hires.sort((a, b) => new Date(a.movement_date).getTime() - new Date(b.movement_date).getTime());
      terminations.sort((a, b) => new Date(a.movement_date).getTime() - new Date(b.movement_date).getTime());

      return {
        hires,
        terminations,
        totalHires: hires.length,
        totalTerminations: terminations.length,
        netChange: hires.length - terminations.length,
      };
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
