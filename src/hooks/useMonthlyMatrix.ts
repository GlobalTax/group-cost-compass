import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

interface MonthlyMatrixFilters {
  year: number;
  companyId?: string;
  costType: "bruto" | "total";
}

export interface EmployeeMonthlyRow {
  employee_id: string;
  full_name: string;
  company: string;
  months: { [key: string]: number };
  total: number;
}

export const useMonthlyMatrix = (filters: MonthlyMatrixFilters) => {
  return useQuery({
    queryKey: ["monthly-matrix", filters],
    queryFn: async () => {
      // 1. Construir array de meses del año
      const monthsOfYear = Array.from({ length: 12 }, (_, i) => {
        const month = String(i + 1).padStart(2, "0");
        return `${filters.year}-${month}`;
      });

      // 2. Obtener costes del año completo
      let query = supabase
        .from("hr_employee_costs")
        .select(`
          employee_id,
          period,
          bruto,
          coste_empresa,
          hr_employees!inner(
            full_name,
            company_id,
            companies!inner(name)
          )
        `)
        .gte("period", `${filters.year}-01-01`)
        .lte("period", `${filters.year}-12-31`);

      if (filters.companyId && filters.companyId !== "all") {
        query = query.eq("hr_employees.company_id", filters.companyId);
      }

      const { data: costs, error } = await query;
      if (error) throw error;

      // 3. Agrupar por empleado y mes
      const employeeMap = new Map<string, EmployeeMonthlyRow>();

      costs?.forEach((cost: any) => {
        const employee = cost.hr_employees;
        const employeeId = cost.employee_id;
        const period = cost.period.substring(0, 7); // "2025-01"
        const value = filters.costType === "bruto" 
          ? cost.bruto 
          : cost.coste_empresa;

        if (!employeeMap.has(employeeId)) {
          employeeMap.set(employeeId, {
            employee_id: employeeId,
            full_name: employee.full_name,
            company: employee.companies.name,
            months: {},
            total: 0,
          });
        }

        const row = employeeMap.get(employeeId)!;
        row.months[period] = value;
        row.total += value;
      });

      // 4. Convertir Map a Array y ordenar
      const rows = Array.from(employeeMap.values()).sort((a, b) =>
        a.full_name.localeCompare(b.full_name)
      );

      // 5. Calcular totales por mes
      const monthlyTotals: { [key: string]: number } = {};
      monthsOfYear.forEach((month) => {
        monthlyTotals[month] = rows.reduce(
          (sum, row) => sum + (row.months[month] || 0),
          0
        );
      });

      return {
        rows,
        monthlyTotals,
        monthsOfYear,
        grandTotal: rows.reduce((sum, row) => sum + row.total, 0),
      };
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
