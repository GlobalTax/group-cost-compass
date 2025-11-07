import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

interface MonthlyRevenueMatrixFilters {
  year: number;
  companyId?: string;
  viewMode: "assignee" | "client" | "company";
  startMonth?: number;
  endMonth?: number;
}

export interface RevenueMatrixRow {
  id: string;
  name: string;
  type: "employee" | "team" | "company" | "client" | "unassigned";
  months: { 
    [key: string]: { 
      amount: number; 
      items: any[] 
    } 
  };
  total: number;
}

export const useMonthlyRevenueMatrix = (filters: MonthlyRevenueMatrixFilters) => {
  return useQuery({
    queryKey: ["monthly-revenue-matrix", filters],
    queryFn: async () => {
      // 1. Construir array de meses del año (con rango)
      const startMonth = filters.startMonth || 1;
      const endMonth = filters.endMonth || 12;
      const monthCount = endMonth - startMonth + 1;
      
      const monthsOfYear = Array.from({ length: monthCount }, (_, i) => {
        const month = String(startMonth + i).padStart(2, "0");
        return `${filters.year}-${month}`;
      });

      // 2. Obtener ingresos del año completo con asignaciones
      let query = supabase
        .from("revenue_items")
        .select(`
          id,
          period,
          description,
          total_amount,
          client_name,
          is_recurring,
          company_id,
          companies!inner(name),
          revenue_allocations(
            id,
            employee_id,
            team_id,
            allocated_amount,
            allocation_percentage,
            hr_employees(id, full_name),
            teams(id, name)
          )
        `);
      
      const startDate = `${filters.year}-${String(startMonth).padStart(2, "0")}-01`;
      const endDate = new Date(filters.year, endMonth, 0);
      const endDateStr = endDate.toISOString().split('T')[0];
      
      query = query
        .gte("period", startDate)
        .lte("period", endDateStr);

      if (filters.companyId && filters.companyId !== "all") {
        query = query.eq("company_id", filters.companyId);
      }

      const { data: revenues, error } = await query;
      if (error) throw error;

      // 3. Agrupar según viewMode
      const rowMap = new Map<string, RevenueMatrixRow>();

      revenues?.forEach((revenue: any) => {
        const period = revenue.period.substring(0, 7); // "2025-01"
        const allocations = revenue.revenue_allocations || [];

        if (filters.viewMode === "assignee") {
          // Vista por empleado/equipo
          if (allocations.length === 0) {
            // Sin asignar
            const key = "unassigned";
            if (!rowMap.has(key)) {
              rowMap.set(key, {
                id: key,
                name: "Sin asignar",
                type: "unassigned",
                months: {},
                total: 0,
              });
            }
            const row = rowMap.get(key)!;
            if (!row.months[period]) {
              row.months[period] = { amount: 0, items: [] };
            }
            row.months[period].amount += revenue.total_amount;
            row.months[period].items.push(revenue);
            row.total += revenue.total_amount;
          } else {
            allocations.forEach((alloc: any) => {
              const key = alloc.employee_id || alloc.team_id;
              const name = alloc.hr_employees?.full_name || alloc.teams?.name || "Desconocido";
              const type = alloc.employee_id ? "employee" : "team";
              
              if (!rowMap.has(key)) {
                rowMap.set(key, {
                  id: key,
                  name,
                  type,
                  months: {},
                  total: 0,
                });
              }
              
              const row = rowMap.get(key)!;
              if (!row.months[period]) {
                row.months[period] = { amount: 0, items: [] };
              }
              row.months[period].amount += alloc.allocated_amount;
              row.months[period].items.push({
                ...revenue,
                allocated_amount: alloc.allocated_amount,
                allocation_percentage: alloc.allocation_percentage,
              });
              row.total += alloc.allocated_amount;
            });
          }
        } else if (filters.viewMode === "client") {
          // Vista por cliente
          const key = revenue.client_name || "Sin cliente";
          if (!rowMap.has(key)) {
            rowMap.set(key, {
              id: key,
              name: key,
              type: "client",
              months: {},
              total: 0,
            });
          }
          const row = rowMap.get(key)!;
          if (!row.months[period]) {
            row.months[period] = { amount: 0, items: [] };
          }
          row.months[period].amount += revenue.total_amount;
          row.months[period].items.push(revenue);
          row.total += revenue.total_amount;
        } else if (filters.viewMode === "company") {
          // Vista por empresa
          const key = revenue.company_id;
          const name = revenue.companies?.name || "Sin empresa";
          if (!rowMap.has(key)) {
            rowMap.set(key, {
              id: key,
              name,
              type: "company",
              months: {},
              total: 0,
            });
          }
          const row = rowMap.get(key)!;
          if (!row.months[period]) {
            row.months[period] = { amount: 0, items: [] };
          }
          row.months[period].amount += revenue.total_amount;
          row.months[period].items.push(revenue);
          row.total += revenue.total_amount;
        }
      });

      // 4. Convertir Map a Array y ordenar
      const rows = Array.from(rowMap.values()).sort((a, b) => {
        // "Sin asignar" siempre al final
        if (a.type === "unassigned") return 1;
        if (b.type === "unassigned") return -1;
        return a.name.localeCompare(b.name);
      });

      // 5. Calcular totales por mes
      const monthlyTotals: { [key: string]: number } = {};
      monthsOfYear.forEach((month) => {
        monthlyTotals[month] = rows.reduce(
          (sum, row) => sum + (row.months[month]?.amount || 0),
          0
        );
      });

      return {
        rows,
        monthlyTotals,
        monthsOfYear,
        grandTotal: rows.reduce((sum, row) => sum + row.total, 0),
      };
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};
