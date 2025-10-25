import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardFilters {
  year?: number;
  companyId?: string;
}

export const useDashboardGlobal = (filters?: DashboardFilters) => {
  return useQuery({
    queryKey: ["dashboard-global", filters],
    queryFn: async () => {
      const currentYear = filters?.year || new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;

      // Get active employees
      let employeesQuery = supabase
        .from("hr_employees")
        .select("id, company_id, companies(name)")
        .is("termination_date", null);

      if (filters?.companyId) {
        employeesQuery = employeesQuery.eq("company_id", filters.companyId);
      }

      const { data: employees } = await employeesQuery;

      // Get costs for the year
      let costsQuery = supabase
        .from("hr_employee_costs")
        .select(`
          id,
          period,
          bruto,
          coste_empresa,
          hr_employees!inner (
            id,
            company_id,
            companies (
              id,
              name
            )
          )
        `)
        .gte("period", startDate)
        .lte("period", endDate);

      const { data: costsData } = await costsQuery;

      // Filter by company if needed
      const filteredCosts = filters?.companyId
        ? costsData?.filter(c => c.hr_employees?.company_id === filters.companyId)
        : costsData;

      // Calculate totals
      const brutoTotal = filteredCosts?.reduce((sum, c) => sum + (c.bruto || 0), 0) || 0;
      const costeTotal = filteredCosts?.reduce((sum, c) => sum + (c.coste_empresa || 0), 0) || 0;
      const activeEmployees = employees?.length || 0;
      const avgCostPerEmployee = activeEmployees > 0 ? costeTotal / activeEmployees : 0;

      // Get previous year data for salary increase %
      const prevYear = currentYear - 1;
      const prevStartDate = `${prevYear}-01-01`;
      const prevEndDate = `${prevYear}-12-31`;

      let prevCostsQuery = supabase
        .from("hr_employee_costs")
        .select(`
          bruto,
          hr_employees!inner (
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
      const salaryIncreasePercent = prevBrutoTotal > 0
        ? ((brutoTotal - prevBrutoTotal) / prevBrutoTotal) * 100
        : 0;

      // Group by company
      const byCompany = (filteredCosts || []).reduce((acc, cost) => {
        const companyId = cost.hr_employees?.company_id;
        const companyName = cost.hr_employees?.companies?.name || "Sin empresa";
        
        if (!acc[companyId!]) {
          acc[companyId!] = {
            id: companyId,
            name: companyName,
            bruto: 0,
            coste: 0,
            employees: new Set(),
          };
        }
        
        acc[companyId!].bruto += cost.bruto || 0;
        acc[companyId!].coste += cost.coste_empresa || 0;
        acc[companyId!].employees.add(cost.hr_employees?.id);
        
        return acc;
      }, {} as Record<string, any>);

      const companiesData = Object.values(byCompany).map((c: any) => ({
        id: c.id,
        name: c.name,
        bruto: c.bruto,
        coste: c.coste,
        employees: c.employees.size,
        percentOfTotal: costeTotal > 0 ? (c.coste / costeTotal) * 100 : 0,
      }));

      // Group by month for heatmap
      const monthlyData = (filteredCosts || []).reduce((acc, cost) => {
        const month = cost.period.substring(0, 7); // YYYY-MM
        if (!acc[month]) {
          acc[month] = { month, totalCost: 0, employees: new Set() };
        }
        acc[month].totalCost += cost.coste_empresa || 0;
        acc[month].employees.add(cost.hr_employees?.id);
        return acc;
      }, {} as Record<string, any>);

      const heatmapData = Object.values(monthlyData).map((m: any) => ({
        month: m.month,
        avgCostPerEmployee: m.employees.size > 0 ? m.totalCost / m.employees.size : 0,
        employees: m.employees.size,
      }));

      return {
        kpis: {
          costeTotal,
          activeEmployees,
          avgCostPerEmployee,
          salaryIncreasePercent,
        },
        companiesData,
        heatmapData,
      };
    },
  });
};
