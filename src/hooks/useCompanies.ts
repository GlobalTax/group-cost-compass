import { useQuery } from "@tanstack/react-query";
import { fetchCompanies } from "@/lib/supabase/repositories/companies.repo";

/**
 * Hook para consultar todas las empresas del grupo
 * 
 * @returns {UseQueryResult} Query result con lista de empresas del catálogo
 * 
 * @example
 * const { data: companies, isLoading } = useCompanies();
 * 
 * @remarks
 * - Cache: 60s (las empresas cambian poco)
 * - No refetch automático en focus
 * - Incluye todas las empresas sin filtros
 * 
 * @see {@link src/lib/supabase/repositories/companies.repo.ts}
 */
export const useCompanies = () => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
    staleTime: 60000, // 1 minuto (empresas cambian poco)
    refetchOnWindowFocus: false,
  });
};
