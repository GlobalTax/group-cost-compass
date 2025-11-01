import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { AppRole } from "@/lib/auth";

interface UserRole {
  role: AppRole;
  canEdit: boolean;
}

/**
 * Hook para obtener el rol del usuario actual
 * Verifica si tiene permisos de edición (admin o rrhh)
 */
export const useCurrentUserRole = () => {
  return useQuery<UserRole>({
    queryKey: ["current-user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { role: "guest" as AppRole, canEdit: false };
      }

      // Obtener roles del usuario
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;

      // Si tiene algún rol de admin, manager o super_admin, puede editar
      const userRoles = roles?.map(r => r.role as AppRole) || [];
      const canEdit = userRoles.some(role => 
        role === "admin" || role === "manager" || role === "super_admin"
      );

      // Devolver el primer rol (o guest si no tiene ninguno)
      const primaryRole = userRoles[0] || ("guest" as AppRole);

      return {
        role: primaryRole,
        canEdit,
      };
    },
    staleTime: 60000, // Cache por 1 minuto
  });
};
