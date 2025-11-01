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
});

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
      queryClient.invalidateQueries({ queryKey: ["costs-overview"] });
      queryClient.invalidateQueries({ queryKey: ["employees-with-costs"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Equipo actualizado correctamente");
    },
    onError: (error: Error) => {
      console.error("Error updating team:", error);
      toast.error(`Error al actualizar equipo: ${error.message}`);
    },
  });
};
