import { useDashboardKPIs } from "./useDashboardKPIs";
import { useDashboardCompanies } from "./useDashboardCompanies";
import { useDashboardHeatmap } from "./useDashboardHeatmap";

export interface DashboardFilters {
  year?: number;
  companyId?: string;
}

/**
 * Hook orquestador del dashboard - Delega en hooks especializados
 * 
 * @param filters Filtros opcionales (year, companyId)
 * @returns Datos agregados de KPIs, empresas y heatmap
 * 
 * @example
 * const { data, isLoading } = useDashboardGlobal({ year: 2024 });
 */
export const useDashboardGlobal = (filters?: DashboardFilters) => {
  const kpisQuery = useDashboardKPIs(filters);
  const companiesQuery = useDashboardCompanies(filters);
  const heatmapQuery = useDashboardHeatmap(filters);

  return {
    data: {
      kpis: kpisQuery.data || { costeTotal: 0, activeEmployees: 0, avgCostPerEmployee: 0, salaryIncreasePercent: 0 },
      companiesData: companiesQuery.data || [],
      heatmapData: heatmapQuery.data || [],
    },
    isLoading: kpisQuery.isLoading || companiesQuery.isLoading || heatmapQuery.isLoading,
    error: kpisQuery.error || companiesQuery.error || heatmapQuery.error,
  };
};
