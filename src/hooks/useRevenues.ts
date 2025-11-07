import { useQuery } from "@tanstack/react-query";
import { fetchRevenueItems, fetchRevenueItemById, fetchRevenueAnalytics } from "@/lib/supabase/repositories/revenue.repo";

/**
 * Hook para consultar todos los ingresos con filtros
 */
export const useRevenues = (filters?: {
  year?: number;
  companyId?: string;
  isRecurring?: boolean;
}) => {
  return useQuery({
    queryKey: ["revenues", filters],
    queryFn: () => fetchRevenueItems(filters),
    staleTime: 30000,
  });
};

/**
 * Hook para consultar un ingreso específico
 */
export const useRevenueDetail = (id: string) => {
  return useQuery({
    queryKey: ["revenues", id],
    queryFn: () => fetchRevenueItemById(id),
    enabled: !!id,
  });
};

/**
 * Hook para analítica de ingresos
 */
export const useRevenueAnalytics = (filters?: {
  year?: number;
  companyId?: string;
}) => {
  return useQuery({
    queryKey: ["revenue-analytics", filters],
    queryFn: () => fetchRevenueAnalytics(filters),
    staleTime: 30000,
  });
};
