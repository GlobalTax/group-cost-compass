import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type EmployeeInsert = Database["public"]["Tables"]["hr_employees"]["Insert"];

export const useBulkCreateEmployees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employees: EmployeeInsert[]) => {
      const { data, error } = await supabase
        .from("hr_employees")
        .insert(employees)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success(`${data.length} empleado(s) creado(s) automáticamente`);
    },
    onError: (error: Error) => {
      toast.error(`Error al crear empleados: ${error.message}`);
    },
  });
};
