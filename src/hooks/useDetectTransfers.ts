import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DetectedTransfer {
  employeeName: string;
  fromCompany: string;
  toCompany: string;
  days: number;
}

export const useDetectTransfers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employeeId?: string) => {
      const detectedTransfers: DetectedTransfer[] = [];

      // Get all employees or specific employee
      let employeesQuery = supabase
        .from("hr_employees")
        .select(`
          *,
          companies (
            id,
            name
          )
        `);

      if (employeeId) {
        employeesQuery = employeesQuery.eq("id", employeeId);
      }

      const { data: employees, error: empError } = await employeesQuery;
      if (empError) throw empError;

      for (const currentEmployee of employees || []) {
        // Find other records of the same employee (by DNI)
        const { data: previousEmployees } = await supabase
          .from("hr_employees")
          .select(`
            *,
            companies (
              id,
              name
            )
          `)
          .eq("dni", currentEmployee.dni)
          .neq("id", currentEmployee.id)
          .not("termination_date", "is", null)
          .order("termination_date", { ascending: false });

        for (const prevEmployee of previousEmployees || []) {
          if (!prevEmployee.termination_date || !currentEmployee.hire_date) continue;

          const daysBetween = Math.abs(
            (new Date(currentEmployee.hire_date).getTime() -
              new Date(prevEmployee.termination_date).getTime()) /
            (1000 * 60 * 60 * 24)
          );

          if (daysBetween <= 180) {
            // Check if transfer already exists
            const { data: existing } = await supabase
              .from("hr_transfers")
              .select("id")
              .eq("employee_id", currentEmployee.id)
              .eq("from_company", prevEmployee.company_id)
              .eq("to_company", currentEmployee.company_id);

            if (!existing || existing.length === 0) {
              // Create automatic transfer
              await supabase
                .from("hr_transfers")
                .insert({
                  employee_id: currentEmployee.id,
                  from_company: prevEmployee.company_id,
                  to_company: currentEmployee.company_id,
                  transfer_date: currentEmployee.hire_date,
                  reason: `Traslado automático detectado (${Math.round(daysBetween)} días entre contratos)`,
                });

              // Mark both employee records
              await supabase
                .from("hr_employees")
                .update({ transfer_group: true })
                .in("id", [currentEmployee.id, prevEmployee.id]);

              detectedTransfers.push({
                employeeName: currentEmployee.full_name,
                fromCompany: prevEmployee.companies?.name || "Empresa anterior",
                toCompany: currentEmployee.companies?.name || "Empresa actual",
                days: Math.round(daysBetween),
              });
            }
          }
        }
      }

      return detectedTransfers;
    },
    onSuccess: (detectedTransfers) => {
      if (detectedTransfers.length > 0) {
        detectedTransfers.forEach((t) => {
          toast.success(
            `Se detectó un traslado interempresa automático: ${t.employeeName} → ${t.toCompany} (${t.days} días)`,
            { duration: 5000 }
          );
        });
      } else {
        toast.info("No se detectaron nuevos traslados automáticos");
      }
      queryClient.invalidateQueries({ queryKey: ["transfers"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error: Error) => {
      toast.error(`Error al detectar traslados: ${error.message}`);
    },
  });
};
