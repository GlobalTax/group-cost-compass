import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { updateEmployee } from "@/lib/supabase/repositories/employees.repo";
import { createAuditLog } from "@/lib/supabase/repositories/audit.repo";
import { toast } from "sonner";
import { z } from "zod";

const teamUpdateSchema = z.object({
  employeeId: z.string().uuid(),
  newTeamId: z.string().uuid().nullable(),
  oldTeamId: z.string().uuid().nullable(),
}).refine(
  (data) => data.newTeamId !== undefined,
  { message: "newTeamId es requerido" }
);

interface UpdateTeamParams {
  employeeId: string;
  newTeamId: string | null;
  oldTeamId: string | null;
}

export const useUpdateEmployeeTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateTeamParams) => {
      const validated = teamUpdateSchema.parse(params);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // Validar org_id y estado antes de actualizar
      if (validated.newTeamId) {
        const { data: team } = await supabase
          .from("teams")
          .select("org_id, department_id, is_active")
          .eq("id", validated.newTeamId)
          .single();

        if (!team) throw new Error("Equipo no encontrado");
        if (!team.is_active) throw new Error("El equipo está inactivo");

        const { data: employee } = await supabase
          .from("hr_employees")
          .select("org_id, department_id, termination_date")
          .eq("id", validated.employeeId)
          .single();

        if (!employee) throw new Error("Empleado no encontrado");
        if (employee.termination_date) throw new Error("Empleado inactivo");
        
        if (employee.org_id !== team.org_id) {
          throw new Error("El empleado pertenece a otra organización");
        }

        // Advertencia si es de otro departamento (no bloquear asignaciones transversales)
        if (employee.department_id !== team.department_id) {
          console.warn(`Equipo ${validated.newTeamId} es de otro departamento`);
        }
      }

      const updatedEmployee = await updateEmployee(validated.employeeId, {
        team_id: validated.newTeamId,
      });

      await createAuditLog({
        user_id: user.id,
        action: "update",
        table_name: "hr_employees",
        record_id: validated.employeeId,
        old_data: { team_id: validated.oldTeamId },
        new_data: { team_id: validated.newTeamId },
      });

      return updatedEmployee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["costs-overview"] });
      toast.success("Equipo actualizado correctamente");
    },
    onError: (error: Error) => {
      console.error("Error updating team:", error);
      toast.error(`Error al asignar equipo: ${error.message}`);
      throw error;
    },
  });
};
