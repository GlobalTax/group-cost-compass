import { useQuery } from "@tanstack/react-query";
import { fetchCompanies } from "@/lib/supabase/repositories/companies.repo";

export const useCompanies = () => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
    staleTime: 60000, // 1 minuto (empresas cambian poco)
    refetchOnWindowFocus: false,
  });
};
