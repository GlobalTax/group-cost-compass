import { useDashboardKPIs } from "./useDashboardKPIs";
import { useDashboardCompanies } from "./useDashboardCompanies";
import { useDashboardHeatmap } from "./useDashboardHeatmap";

export interface DashboardFilters {
  year?: number;
  companyId?: string;
  month?: string; // "YYYY-MM" or "all"
}

/**
 * Hook orquestador del dashboard - Delega en hooks especializados
 * Combina KPIs, datos de empresas y heatmap en una sola interfaz
 * 
 * @param {Object} [filters] - Filtros opcionales
 * @param {number} [filters.year] - Año fiscal a consultar
 * @param {string} [filters.companyId] - ID de empresa específica (undefined = todas)
 * 
 * @returns {Object} Objeto con data, isLoading y error
 * @returns {Object} data.kpis - KPIs agregados (costeTotal, activeEmployees, avgCostPerEmployee, salaryIncreasePercent)
 * @returns {Array} data.companiesData - Datos por empresa para gráficos y tabla
 * @returns {Array} data.heatmapData - Datos mensuales para heatmap
 * 
 * @example
 * // Dashboard año actual, todas empresas
 * const { data, isLoading } = useDashboardGlobal({ year: 2025 });
 * 
 * @example
 * // Dashboard filtrado por empresa
 * const { data } = useDashboardGlobal({ 
 *   year: 2025, 
 *   companyId: "uuid-empresa" 
 * });
 * 
 * @remarks
 * - Ejecuta 3 queries en paralelo (KPIs, empresas, heatmap)
 * - isLoading es true si alguna query está cargando
 * - error contiene el primer error encontrado (si hay)
 * - Usa React Query para cache y refetch automático
 * 
 * @see {@link useDashboardKPIs}
 * @see {@link useDashboardCompanies}
 * @see {@link useDashboardHeatmap}
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
