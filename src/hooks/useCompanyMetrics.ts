import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CompanyMetrics {
  id: string;
  name: string;
  nif: string;
  activeEmployees: number;
  totalBruto: number;
  totalCoste: number;
  salaryIncreasePercent: number;
  transfers: number;
}

export const useCompanyMetrics = (year?: number) => {
  return useQuery({
    queryKey: ["company-metrics", year],
    queryFn: async () => {
      const currentYear = year || new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;

      // Get all companies
      const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select("*")
        .order("name");

      if (companiesError) throw companiesError;

      // Get costs for the year
      const { data: costsData, error: costsError } = await supabase
        .from("hr_employee_costs")
        .select(`
          bruto,
          coste_empresa,
          hr_employees!inner (
            id,
            company_id,
            termination_date
          )
        `)
        .gte("period", startDate)
        .lte("period", endDate);

      if (costsError) throw costsError;

      // Get previous year costs
      const prevYear = currentYear - 1;
      const prevStartDate = `${prevYear}-01-01`;
      const prevEndDate = `${prevYear}-12-31`;

      const { data: prevCostsData } = await supabase
        .from("hr_employee_costs")
        .select(`
          bruto,
          hr_employees!inner (
            company_id
          )
        `)
        .gte("period", prevStartDate)
        .lte("period", prevEndDate);

      // Get transfers
      const { data: transfersData } = await supabase
        .from("hr_transfers")
        .select(`
          id,
          from_company,
          to_company
        `)
        .gte("transfer_date", startDate)
        .lte("transfer_date", endDate);

      // Calculate metrics per company
      const metricsPromises = companies?.map(async (company) => {
        // Get active employees
        const { count: activeEmployees } = await supabase
          .from("hr_employees")
          .select("*", { count: "exact", head: true })
          .eq("company_id", company.id)
          .is("termination_date", null);

        // Calculate costs for this company
        const companyCosts = costsData?.filter(
          (c) => c.hr_employees?.company_id === company.id
        );
        const totalBruto = companyCosts?.reduce((sum, c) => sum + (c.bruto || 0), 0) || 0;
        const totalCoste = companyCosts?.reduce((sum, c) => sum + (c.coste_empresa || 0), 0) || 0;

        // Previous year bruto for salary increase
        const prevCompanyCosts = prevCostsData?.filter(
          (c) => c.hr_employees?.company_id === company.id
        );
        const prevBruto = prevCompanyCosts?.reduce((sum, c) => sum + (c.bruto || 0), 0) || 0;
        const salaryIncreasePercent = prevBruto > 0
          ? ((totalBruto - prevBruto) / prevBruto) * 100
          : 0;

        // Count transfers involving this company
        const transfers = transfersData?.filter(
          (t) => t.from_company === company.id || t.to_company === company.id
        ).length || 0;

        return {
          id: company.id,
          name: company.name,
          nif: company.nif || "—",
          activeEmployees: activeEmployees || 0,
          totalBruto,
          totalCoste,
          salaryIncreasePercent,
          transfers,
        };
      }) || [];

      const metrics = await Promise.all(metricsPromises);

      return metrics as CompanyMetrics[];
    },
  });
};
