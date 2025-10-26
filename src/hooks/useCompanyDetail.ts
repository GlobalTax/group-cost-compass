import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCompanyDetail = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ["company-detail", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      if (!companyId) return null;

      // Get company info
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", companyId)
        .single();

      if (companyError) throw companyError;

      // Get active employees
      const { data: employees, count: activeEmployees, error: employeesError } = await supabase
        .from("hr_employees")
        .select("*", { count: "exact" })
        .eq("company_id", companyId)
        .is("termination_date", null);

      if (employeesError) throw employeesError;

      // Get costs for current year
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;

      const { data: costs, error: costsError } = await supabase
        .from("hr_employee_costs")
        .select(`
          bruto,
          coste_empresa,
          hr_employees!inner (
            company_id
          )
        `)
        .eq("hr_employees.company_id", companyId)
        .gte("period", startDate)
        .lte("period", endDate);

      if (costsError) throw costsError;

      const totalBruto = costs?.reduce((sum, c) => sum + (c.bruto || 0), 0) || 0;
      const totalCoste = costs?.reduce((sum, c) => sum + (c.coste_empresa || 0), 0) || 0;

      // Previous year for comparison
      const prevYear = currentYear - 1;
      const prevStartDate = `${prevYear}-01-01`;
      const prevEndDate = `${prevYear}-12-31`;

      const { data: prevCosts, error: prevCostsError } = await supabase
        .from("hr_employee_costs")
        .select(`
          bruto,
          hr_employees!inner (
            company_id
          )
        `)
        .eq("hr_employees.company_id", companyId)
        .gte("period", prevStartDate)
        .lte("period", prevEndDate);

      if (prevCostsError) throw prevCostsError;

      const prevBruto = prevCosts?.reduce((sum, c) => sum + (c.bruto || 0), 0) || 0;
      const salaryIncreasePercent = prevBruto > 0
        ? ((totalBruto - prevBruto) / prevBruto) * 100
        : 0;

      // Get transfers
      const { data: transfers, error: transfersError } = await supabase
        .from("hr_transfers")
        .select(`
          *,
          hr_employees!inner (
            id,
            full_name
          ),
          from_company:companies!hr_transfers_from_company_fkey (
            id,
            name
          ),
          to_company:companies!hr_transfers_to_company_fkey (
            id,
            name
          )
        `)
        .or(`from_company.eq.${companyId},to_company.eq.${companyId}`)
        .order("transfer_date", { ascending: false });

      if (transfersError) throw transfersError;

      return {
        ...companyData,
        activeEmployees: activeEmployees || 0,
        totalBruto,
        totalCoste,
        salaryIncreasePercent,
        employees: employees || [],
        transfers: transfers || [],
      };
    },
  });
};
