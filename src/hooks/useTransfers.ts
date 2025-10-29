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

export const useTransfersWithDetails = (employeeId?: string) => {
  return useQuery({
    queryKey: ["transfers-detailed", employeeId],
    queryFn: async () => {
      let query = supabase
        .from("hr_transfers")
        .select(`
          id,
          employee_id,
          transfer_date,
          reason,
          from_company,
          to_company,
          hr_employees!inner (
            id,
            full_name,
            dni
          ),
          from_company_data:companies!hr_transfers_from_company_fkey (
            id,
            name
          ),
          to_company_data:companies!hr_transfers_to_company_fkey (
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

      // Enrich with calculations
      const enrichedData = await Promise.all(
        (data || []).map(async (transfer) => {
          // Validar que tenemos UUIDs válidos antes de consultar
          if (
            typeof transfer.from_company !== 'string' ||
            typeof transfer.to_company !== 'string'
          ) {
            console.warn('⚠️ Transfer con company_id inválido:', transfer);
            return {
              ...transfer,
              daysBetween: undefined,
              isRecent: false,
              daysAgo: Math.round(
                Math.abs(
                  (new Date().getTime() -
                    new Date(transfer.transfer_date).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              ),
            };
          }

          // Calculate days between contracts usando los UUIDs crudos
          const { data: fromEmp } = await supabase
            .from("hr_employees")
            .select("termination_date")
            .eq("dni", transfer.hr_employees.dni)
            .eq("company_id", transfer.from_company)
            .maybeSingle();

          const { data: toEmp } = await supabase
            .from("hr_employees")
            .select("hire_date")
            .eq("dni", transfer.hr_employees.dni)
            .eq("company_id", transfer.to_company)
            .maybeSingle();

          const daysBetween =
            fromEmp?.termination_date && toEmp?.hire_date
              ? Math.abs(
                  (new Date(toEmp.hire_date).getTime() -
                    new Date(fromEmp.termination_date).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : undefined;

          // Calculate if recent
          const daysAgo = Math.abs(
            (new Date().getTime() -
              new Date(transfer.transfer_date).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          const isRecent = daysAgo <= 180;

          return {
            ...transfer,
            daysBetween: daysBetween ? Math.round(daysBetween) : undefined,
            isRecent,
            daysAgo: Math.round(daysAgo),
          };
        })
      );

      return enrichedData;
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
      days_between?: number;
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
      queryClient.invalidateQueries({ queryKey: ["transfers-detailed"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Traslado registrado correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al registrar traslado: ${error.message}`);
    },
  });
};
