import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { updateEmployee } from "@/lib/supabase/repositories/employees.repo";
import { createAuditLog } from "@/lib/supabase/repositories/audit.repo";
import { toast } from "sonner";
import { z } from "zod";

const departmentUpdateSchema = z.object({
  employeeId: z.string().uuid(),
  newDepartmentId: z.string().uuid().nullable(),
  oldDepartmentId: z.string().uuid().nullable(),
});

interface UpdateDepartmentParams {
  employeeId: string;
  newDepartmentId: string | null;
  oldDepartmentId: string | null;
}

export const useUpdateEmployeeDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateDepartmentParams) => {
      const validated = departmentUpdateSchema.parse(params);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const updatedEmployee = await updateEmployee(validated.employeeId, {
        department_id: validated.newDepartmentId,
      });

      await createAuditLog({
        user_id: user.id,
        action: "update",
        table_name: "hr_employees",
        record_id: validated.employeeId,
        old_data: { department_id: validated.oldDepartmentId },
        new_data: { department_id: validated.newDepartmentId },
      });

      return updatedEmployee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["costs-overview"] });
      queryClient.invalidateQueries({ queryKey: ["employees-with-costs"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Departamento actualizado correctamente");
    },
    onError: (error: Error) => {
      console.error("Error updating department:", error);
      toast.error(`Error al actualizar departamento: ${error.message}`);
    },
  });
};
