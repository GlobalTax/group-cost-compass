/**
 * Hook especializado para datos de empresas en dashboard
 * Extrae lógica de useDashboardGlobal
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY } from "@/lib/constants";
import type { DashboardFilters } from "./useDashboardGlobal";

export const useDashboardCompanies = (filters?: DashboardFilters) => {
  return useQuery({
    queryKey: ["dashboard-companies", filters],
    queryFn: async () => {
      const currentYear = filters?.year || new Date().getFullYear();

      // Usar vista optimizada vw_dashboard_monthly (tipado como any mientras se regeneran tipos)
      let query = supabase
        .from("vw_dashboard_monthly" as any)
        .select("*")
        .gte("month", `${currentYear}-01-01`)
        .lte("month", `${currentYear}-12-31`);

      if (filters?.companyId) {
        query = query.eq("company_id", filters.companyId);
      }

      const { data, error }: { data: any; error: any } = await query;
      if (error) throw error;

      // Agrupar por empresa
      const byCompany = (data || []).reduce(
        (acc, row) => {
          const companyId = row.company_id;
          if (!acc[companyId]) {
            acc[companyId] = {
              id: companyId,
              bruto: 0,
              coste: 0,
              employees: new Set<string>(),
            };
          }

          acc[companyId].bruto += row.total_bruto || 0;
          acc[companyId].coste += row.total_coste || 0;
          // Los employees son agregados por mes, necesitamos el máximo
          if (row.employees_count > acc[companyId].employees.size) {
            acc[companyId].employees = new Set(
              Array.from({ length: row.employees_count }, (_, i) => `emp-${i}`)
            );
          }

          return acc;
        },
        {} as Record<string, any>
      );

      // Obtener nombres de empresas
      const companyIds = Object.keys(byCompany);
      const { data: companies } = await supabase
        .from("companies")
        .select("id, name")
        .in("id", companyIds);

      const companyNames = new Map(companies?.map((c) => [c.id, c.name]));

      // Calcular total para porcentajes
      const totalCoste = Object.values(byCompany).reduce(
        (sum, c: any) => sum + (c.coste || 0),
        0
      ) as number;

      // Formatear resultado
      return Object.entries(byCompany).map(([id, data]: [string, any]) => ({
        id,
        name: companyNames.get(id) || "Sin nombre",
        bruto: data.bruto as number,
        coste: data.coste as number,
        employees: data.employees.size,
        percentOfTotal: totalCoste > 0 ? ((data.coste as number) / totalCoste) * 100 : 0,
      }));
    },
    staleTime: QUERY.STALE_TIME,
    retry: QUERY.RETRY,
  });
};
