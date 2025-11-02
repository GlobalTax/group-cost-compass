import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook para obtener empleados con retorno próximo de ausencia
 * 
 * @param daysThreshold - Días de anticipación para considerar "próximo" (default: 30)
 * @returns Lista de empleados con leave_end_date en los próximos N días
 */
export const useUpcomingReturns = (daysThreshold = 30) => {
  return useQuery({
    queryKey: ["upcoming-returns", daysThreshold],
    queryFn: async () => {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + daysThreshold);

      const { data, error } = await supabase
        .from("hr_employees")
        .select(`
          id,
          full_name,
          employment_status,
          leave_end_date,
          leave_reason,
          companies (
            id,
            name
          )
        `)
        .not("leave_end_date", "is", null)
        .gte("leave_end_date", today.toISOString().split('T')[0])
        .lte("leave_end_date", futureDate.toISOString().split('T')[0])
        .order("leave_end_date", { ascending: true });

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
