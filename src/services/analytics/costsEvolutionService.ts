import { fetchCostsByPeriodRange } from "@/lib/supabase/repositories/costs.repo";
import { format, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import type { CostsEvolutionDataPoint } from "@/hooks/useCostsEvolution";

interface CostsEvolutionFilters {
  month: string;
  companyId?: string;
}

export const calculateCostsEvolution = async (
  filters: CostsEvolutionFilters
): Promise<CostsEvolutionDataPoint[]> => {
  // Calcular rango: 12 meses hacia atrás desde mes seleccionado
  const [year, month] = filters.month.split("-").map(Number);
  const referenceDate = new Date(year, month - 1, 1);
  const startDate = subMonths(referenceDate, 11);

  const startPeriod = format(startDate, "yyyy-MM-01");
  const endPeriod = format(referenceDate, "yyyy-MM") + "-31";

  // Obtener costes del repositorio
  const costs = await fetchCostsByPeriodRange(startPeriod, endPeriod, filters.companyId);

  // Agrupar por mes
  const monthlyData = new Map<string, { bruto: number; coste: number; employees: Set<string> }>();

  costs.forEach((cost: any) => {
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
      month: format(currentDate, "MMM yy", { locale: es }),
      bruto: data?.bruto || 0,
      coste: data?.coste || 0,
      employees: data?.employees.size || 0,
    });
  }

  return result;
};
