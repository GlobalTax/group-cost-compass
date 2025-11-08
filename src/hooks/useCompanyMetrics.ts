import { useQuery } from "@tanstack/react-query";
import { fetchCompanyMetrics } from "@/lib/supabase/repositories/companies.repo";

/**
 * Hook para obtener métricas de una empresa
 * Incluye: empleados activos, costes anuales, % subida salarial, transfers
 * 
 * @param companyId - ID de la empresa
 * @param year - Año fiscal (por defecto: año actual)
 */
export const useCompanyMetrics = (companyId: string | null, year?: number) => {
  return useQuery({
    queryKey: ["company-metrics", companyId, year],
    queryFn: () => fetchCompanyMetrics(companyId!, year),
    enabled: !!companyId,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
