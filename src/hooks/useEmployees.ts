import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type EmployeeInsert = Database["public"]["Tables"]["hr_employees"]["Insert"];
type EmployeeUpdate = Database["public"]["Tables"]["hr_employees"]["Update"];

/**
 * Hook para gestión de empleados con filtros y cache optimizado
 * 
 * @param {Object} [filters] - Filtros opcionales
 * @param {string} [filters.companyId] - ID de empresa para filtrar
 * @param {string} [filters.searchTerm] - Búsqueda por nombre o DNI
 * @param {boolean} [filters.activeOnly] - true: solo activos, false: solo inactivos, undefined: todos
 * 
 * @returns {UseQueryResult} Query result con lista de empleados y relación a companies
 * 
 * @example
 * // Empleados activos de una empresa
 * const { data: employees, isLoading } = useEmployees({ 
 *   companyId: "uuid", 
 *   activeOnly: true 
 * });
 * 
 * @example
 * // Búsqueda por término
 * const { data } = useEmployees({ searchTerm: "García" });
 * 
 * @remarks
 * - Cache: definido por QueryClient global
 * - Incluye relación: companies (id, name, nif)
 * - Orden: alfabético por full_name
 * 
 * @see {@link src/lib/supabase/repositories/employees.repo.ts}
 */
export const useEmployees = (filters?: {
  companyId?: string;
  departmentId?: string;
  teamId?: string;
  searchTerm?: string;
  activeOnly?: boolean;
  withoutTeam?: boolean;
}) => {
  return useQuery({
    queryKey: ["employees", filters],
    queryFn: async () => {
      let query = supabase
        .from("hr_employees")
        .select(`
          *,
          companies (
            id,
            name,
            nif
          )
        `)
        .order("full_name");

      if (filters?.companyId) {
        query = query.eq("company_id", filters.companyId);
      }

      if (filters?.departmentId) {
        query = query.eq("department_id", filters.departmentId);
      }

      if (filters?.teamId) {
        query = query.eq("team_id", filters.teamId);
      }

      if (filters?.withoutTeam) {
        query = query.is("team_id", null);
      }

      if (filters?.searchTerm) {
        query = query.or(`full_name.ilike.%${filters.searchTerm}%,dni.ilike.%${filters.searchTerm}%`);
      }

      if (filters?.activeOnly === true) {
        query = query.is("termination_date", null);
      } else if (filters?.activeOnly === false) {
        query = query.not("termination_date", "is", null);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};

export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hr_employees")
        .select(`
          *,
          companies (
            id,
            name,
            nif
          )
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: EmployeeInsert) => {
      const { data: employee, error } = await supabase
        .from("hr_employees")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Empleado creado correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al crear empleado: ${error.message}`);
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EmployeeUpdate }) => {
      const { data: employee, error } = await supabase
        .from("hr_employees")
        .update(data)
        .eq("id", id)
        .select(`
          *,
          companies (
            id,
            name,
            nif
          )
        `)
        .maybeSingle();

      if (error) throw error;
      
      if (!employee) {
        throw new Error("Sin permisos para actualizar o el registro no existe (RLS).");
      }
      
      return employee;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", variables.id] });
      toast.success("Empleado actualizado correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar empleado: ${error.message}`);
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Verificar si tiene costes asociados
      const { count: costsCount } = await supabase
        .from("hr_employee_costs")
        .select("*", { count: "exact", head: true })
        .eq("employee_id", id);

      if (costsCount && costsCount > 0) {
        throw new Error(
          `No se puede eliminar. El empleado tiene ${costsCount} registro(s) de nómina asociados.`
        );
      }

      // Si no tiene costes, proceder con la eliminación
      const { error } = await supabase
        .from("hr_employees")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employees-with-costs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Empleado eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar: ${error.message}`);
    },
  });
};
