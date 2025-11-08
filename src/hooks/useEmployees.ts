import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchEmployees, 
  fetchEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  checkEmployeeCanBeDeleted 
} from "@/lib/supabase/repositories/employees.repo";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type EmployeeInsert = Database["public"]["Tables"]["hr_employees"]["Insert"];
type EmployeeUpdate = Database["public"]["Tables"]["hr_employees"]["Update"];

/**
 * Hook para obtener lista de empleados con filtros opcionales
 * Delega la query al repositorio employees.repo
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
    queryFn: () => fetchEmployees(filters),
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook para obtener un empleado por ID
 * Delega la query al repositorio employees.repo
 */
export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployeeById(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

/**
 * Hook para crear un nuevo empleado
 * Delega la operación al repositorio
 */
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmployeeInsert) => createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Empleado creado correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al crear empleado: ${error.message}`);
    },
  });
};

/**
 * Hook para actualizar un empleado existente
 * Delega la operación al repositorio
 */
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EmployeeUpdate }) => 
      updateEmployee(id, data),
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

/**
 * Hook para eliminar un empleado
 * Delega la operación al repositorio con validación previa
 */
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Verificar si puede eliminarse
      const canDelete = await checkEmployeeCanBeDeleted(id);
      
      if (!canDelete.canDelete) {
        throw new Error(canDelete.reason || "No se puede eliminar el empleado");
      }

      // Proceder con eliminación
      await deleteEmployee(id);
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
