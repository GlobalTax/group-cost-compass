import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MonthlyHeadcountFilters {
  year: number;
  companyId?: string;
  includeLeave?: boolean;
}

export interface HeadcountRow {
  company_id: string;
  company_name: string;
  months: { [key: string]: number };
  total: number;
  maxMonth: number;
  minMonth: number;
}

interface MonthlyHeadcountResult {
  rows: HeadcountRow[];
  monthsOfYear: string[];
  monthlyTotals: { [key: string]: number };
  grandTotal: number;
}

export const useMonthlyHeadcount = (filters: MonthlyHeadcountFilters) => {
  return useQuery({
    queryKey: ["monthly-headcount", filters],
    queryFn: async (): Promise<MonthlyHeadcountResult> => {
      const { year, companyId, includeLeave = false } = filters;

      // Generar array de meses del año
      const monthsOfYear: string[] = [];
      for (let month = 1; month <= 12; month++) {
        monthsOfYear.push(`${year}-${String(month).padStart(2, "0")}`);
      }

      // Query base de empleados
      let query = supabase
        .from("hr_employees")
        .select("id, full_name, company_id, companies(name), hire_date, termination_date, employment_status");

      if (companyId && companyId !== "all") {
        query = query.eq("company_id", companyId);
      }

      const { data: employees, error } = await query;

      if (error) throw error;

      // Agrupar por empresa
      const companiesMap: Map<string, HeadcountRow> = new Map();
      const monthlyTotalsMap: { [key: string]: number } = {};

      // Inicializar totales mensuales
      monthsOfYear.forEach((month) => {
        monthlyTotalsMap[month] = 0;
      });

      // Procesar cada empleado
      employees?.forEach((emp) => {
        const companyId = emp.company_id;
        const companyName = (emp.companies as any)?.name || "Sin empresa";

        // Inicializar empresa si no existe
        if (!companiesMap.has(companyId)) {
          const monthsObj: { [key: string]: number } = {};
          monthsOfYear.forEach((m) => {
            monthsObj[m] = 0;
          });

          companiesMap.set(companyId, {
            company_id: companyId,
            company_name: companyName,
            months: monthsObj,
            total: 0,
            maxMonth: 0,
            minMonth: 0,
          });
        }

        const companyRow = companiesMap.get(companyId)!;

        // Para cada mes, verificar si el empleado estaba activo
        monthsOfYear.forEach((month) => {
          const monthStart = new Date(`${month}-01`);
          const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);

          const hireDate = emp.hire_date ? new Date(emp.hire_date) : null;
          const termDate = emp.termination_date ? new Date(emp.termination_date) : null;

          // Verificar si estaba activo
          const wasHired = !hireDate || hireDate <= monthEnd;
          const notTerminated = !termDate || termDate > monthStart;
          const isActive =
            emp.employment_status !== "terminated" &&
            (includeLeave || emp.employment_status !== "leave");

          if (wasHired && notTerminated && isActive) {
            companyRow.months[month]++;
            monthlyTotalsMap[month]++;
          }
        });
      });

      // Calcular estadísticas por empresa
      const rows: HeadcountRow[] = Array.from(companiesMap.values()).map((row) => {
        const monthValues = Object.values(row.months);
        const sum = monthValues.reduce((a, b) => a + b, 0);
        const avg = sum / 12;

        return {
          ...row,
          total: Math.round(avg * 10) / 10, // Promedio con 1 decimal
          maxMonth: Math.max(...monthValues),
          minMonth: Math.min(...monthValues),
        };
      });

      // Ordenar por nombre de empresa
      rows.sort((a, b) => a.company_name.localeCompare(b.company_name));

      // Calcular gran total (promedio anual)
      const monthlyValues = Object.values(monthlyTotalsMap);
      const grandTotal = monthlyValues.reduce((a, b) => a + b, 0) / 12;

      return {
        rows,
        monthsOfYear,
        monthlyTotals: monthlyTotalsMap,
        grandTotal: Math.round(grandTotal * 10) / 10,
      };
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
