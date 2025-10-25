import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useTransfers = (employeeId?: string) => {
  return useQuery({
    queryKey: ["transfers", employeeId],
    queryFn: async () => {
      let query = supabase
        .from("hr_transfers")
        .select(`
          *,
          hr_employees (
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
        .order("transfer_date", { ascending: false });

      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateTransfer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      employee_id: string;
      from_company: string;
      to_company: string;
      transfer_date: string;
      reason?: string;
    }) => {
      const { data: transfer, error } = await supabase
        .from("hr_transfers")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      
      // Mark employee as transferred
      await supabase
        .from("hr_employees")
        .update({ transfer_group: true })
        .eq("id", data.employee_id);

      return transfer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Traslado registrado correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al registrar traslado: ${error.message}`);
    },
  });
};
