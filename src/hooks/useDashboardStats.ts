import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useDashboardStats = (filters?: {
  companyId?: string;
  year?: number;
}) => {
  return useQuery({
    queryKey: ["dashboard-stats", filters],
    queryFn: async () => {
      const currentYear = filters?.year || new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;

      // Get active employees
      let employeesQuery = supabase
        .from("hr_employees")
        .select("*", { count: "exact", head: true })
        .is("termination_date", null);

      if (filters?.companyId) {
        employeesQuery = employeesQuery.eq("company_id", filters.companyId);
      }

      const { count: activeEmployees } = await employeesQuery;

      // Get costs for the year
      let costsQuery = supabase
        .from("hr_employee_costs")
        .select(`
          bruto,
          coste_empresa,
          hr_employees (
            company_id
          )
        `)
        .gte("period", startDate)
        .lte("period", endDate);

      const { data: costsData } = await costsQuery;

      const filteredCosts = filters?.companyId
        ? costsData?.filter(c => c.hr_employees?.company_id === filters.companyId)
        : costsData;

      const brutoTotal = filteredCosts?.reduce((sum, c) => sum + (c.bruto || 0), 0) || 0;
      const costeTotal = filteredCosts?.reduce((sum, c) => sum + (c.coste_empresa || 0), 0) || 0;

      // Get previous year data for comparison
      const prevYear = currentYear - 1;
      const prevStartDate = `${prevYear}-01-01`;
      const prevEndDate = `${prevYear}-12-31`;

      let prevCostsQuery = supabase
        .from("hr_employee_costs")
        .select(`
          bruto,
          coste_empresa,
          hr_employees (
            company_id
          )
        `)
        .gte("period", prevStartDate)
        .lte("period", prevEndDate);

      const { data: prevCostsData } = await prevCostsQuery;

      const prevFilteredCosts = filters?.companyId
        ? prevCostsData?.filter(c => c.hr_employees?.company_id === filters.companyId)
        : prevCostsData;

      const prevBrutoTotal = prevFilteredCosts?.reduce((sum, c) => sum + (c.bruto || 0), 0) || 0;

      // Calculate percentage change
      const brutoChange = prevBrutoTotal > 0
        ? ((brutoTotal - prevBrutoTotal) / prevBrutoTotal) * 100
        : 0;

      return {
        activeEmployees: activeEmployees || 0,
        brutoTotal,
        costeTotal,
        brutoChange,
        costsCount: filteredCosts?.length || 0,
      };
    },
  });
};

export const useMonthlyCosts = (filters?: {
  companyId?: string;
  year?: number;
}) => {
  return useQuery({
    queryKey: ["monthly-costs", filters],
    queryFn: async () => {
      const currentYear = filters?.year || new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;

      let query = supabase
        .from("hr_employee_costs")
        .select(`
          period,
          bruto,
          coste_empresa,
          hr_employees (
            company_id
          )
        `)
        .gte("period", startDate)
        .lte("period", endDate)
        .order("period");

      const { data, error } = await query;
      
      if (error) throw error;

      // Filter by company if needed
      const filteredData = filters?.companyId
        ? data?.filter(c => c.hr_employees?.company_id === filters.companyId)
        : data;

      // Group by month
      const monthlyData = filteredData?.reduce((acc, cost) => {
        const month = cost.period.substring(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = { period: month, bruto: 0, coste: 0 };
        }
        acc[month].bruto += cost.bruto || 0;
        acc[month].coste += cost.coste_empresa || 0;
        return acc;
      }, {} as Record<string, { period: string; bruto: number; coste: number }>);

      return Object.values(monthlyData || {});
    },
  });
};
