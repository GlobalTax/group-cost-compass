import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { format, subMonths } from "date-fns";
import { es } from "date-fns/locale";

interface CostsEvolutionFilters {
  month: string;       // Mes de referencia "YYYY-MM"
  companyId?: string;
}

export interface CostsEvolutionDataPoint {
  month: string;       // "Ene 25", "Feb 25", etc.
  bruto: number;
  coste: number;       // coste_empresa
  employees: number;   // Número de empleados con coste ese mes
}

export const useCostsEvolution = (filters: CostsEvolutionFilters) => {
  return useQuery({
    queryKey: ["costs-evolution", filters.month, filters.companyId],
    queryFn: async () => {
      // Calcular rango: 12 meses hacia atrás desde mes seleccionado
      const [year, month] = filters.month.split("-").map(Number);
      const referenceDate = new Date(year, month - 1, 1);
      const startDate = subMonths(referenceDate, 11); // 12 meses incluyendo actual

      const startPeriod = format(startDate, "yyyy-MM-01");
      const endPeriod = format(referenceDate, "yyyy-MM") + "-31";

      // Query de costes
      let query = supabase
        .from("hr_employee_costs")
        .select(`
          period,
          bruto,
          coste_empresa,
          employee_id,
          hr_employees!inner(company_id)
        `)
        .gte("period", startPeriod)
        .lte("period", endPeriod);

      if (filters.companyId && filters.companyId !== "all") {
        query = query.eq("hr_employees.company_id", filters.companyId);
      }

      const { data: costs, error } = await query;
      if (error) throw error;

      // Agrupar por mes
      const monthlyData = new Map<string, { bruto: number; coste: number; employees: Set<string> }>();

      costs?.forEach((cost: any) => {
        const monthKey = cost.period.substring(0, 7); // "2025-01"
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            bruto: 0,
            coste: 0,
            employees: new Set(),
          });
        }

        const data = monthlyData.get(monthKey)!;
        data.bruto += cost.bruto || 0;
        data.coste += cost.coste_empresa || 0;
        data.employees.add(cost.employee_id);
      });

      // Generar array de 12 meses con datos
      const result: CostsEvolutionDataPoint[] = [];
      for (let i = 0; i < 12; i++) {
        const currentDate = subMonths(referenceDate, 11 - i);
        const monthKey = format(currentDate, "yyyy-MM");
        const data = monthlyData.get(monthKey);

        result.push({
          month: format(currentDate, "MMM yy", { locale: es }), // "Ene 25"
          bruto: data?.bruto || 0,
          coste: data?.coste || 0,
          employees: data?.employees.size || 0,
        });
      }

      return result;
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
