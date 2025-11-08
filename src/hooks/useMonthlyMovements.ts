import { useQuery } from "@tanstack/react-query";
import { calculateMonthlyMovements } from "@/services/analytics/monthlyMovementsService";

interface MonthlyMovementsFilters {
  month: string;
  companyId?: string;
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
    queryFn: () => calculateMonthlyMovements(filters),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
