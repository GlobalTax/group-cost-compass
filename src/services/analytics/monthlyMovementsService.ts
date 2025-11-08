import { fetchEmployeesByDateRange } from "@/lib/supabase/repositories/employees.repo";
import { format } from "date-fns";
import type { EmployeeMovement, MonthlyMovementsData } from "@/hooks/useMonthlyMovements";

interface MonthlyMovementsFilters {
  month: string;
  companyId?: string;
}

export const calculateMonthlyMovements = async (
  filters: MonthlyMovementsFilters
): Promise<MonthlyMovementsData> => {
  // Parsear mes
  const [year, month] = filters.month.split("-").map(Number);
  const startDate = format(new Date(year, month - 1, 1), "yyyy-MM-dd");
  const endDate = format(new Date(year, month, 0), "yyyy-MM-dd");

  // Obtener empleados del repositorio
  const employees = await fetchEmployeesByDateRange(startDate, endDate, filters.companyId);

  // Separar altas y bajas del mes
  const hires: EmployeeMovement[] = [];
  const terminations: EmployeeMovement[] = [];

  employees.forEach((emp: any) => {
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
};
