import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateEmployeeSalary } from "@/lib/supabase/repositories/employees.repo";
import { createAuditLog } from "@/lib/supabase/repositories/audit.repo";
import { supabase } from "@/lib/supabase/client";
import { z } from "zod";

const salaryUpdateSchema = z.object({
  employeeId: z.string().uuid("ID de empleado inválido"),
  newSalary: z
    .number()
    .min(0, "El salario no puede ser negativo")
    .max(500000, "El salario excede el límite permitido (500.000€)")
    .int("El salario debe ser un número entero"),
});

interface UpdateSalaryParams {
  employeeId: string;
  newSalary: number;
  oldSalary: number | null;
}

export const useUpdateEmployeeSalary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ employeeId, newSalary, oldSalary }: UpdateSalaryParams) => {
      // Validar entrada
      const validation = salaryUpdateSchema.safeParse({ employeeId, newSalary });
      
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Actualizar salario
      const updatedEmployee = await updateEmployeeSalary(employeeId, newSalary);

      // Registrar en auditoría
      await createAuditLog({
        user_id: user.id,
        action: "update",
        table_name: "hr_employees",
        record_id: employeeId,
        old_data: { annual_salary: oldSalary },
        new_data: { annual_salary: newSalary },
      });

      return updatedEmployee;
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ["costs-overview"] });
      queryClient.invalidateQueries({ queryKey: ["employees-with-costs"] });
      queryClient.invalidateQueries({ queryKey: ["employee-annual-costs"] });
      
      toast.success("Salario actualizado correctamente");
    },
    onError: (error: Error) => {
      console.error("Error updating salary:", error);
      toast.error(error.message || "Error al actualizar el salario");
    },
  });
};
