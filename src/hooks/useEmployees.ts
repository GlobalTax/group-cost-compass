import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type EmployeeInsert = Database["public"]["Tables"]["hr_employees"]["Insert"];
type EmployeeUpdate = Database["public"]["Tables"]["hr_employees"]["Update"];

export const useEmployees = (filters?: {
  companyId?: string;
  searchTerm?: string;
  activeOnly?: boolean;
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
      const { error } = await supabase
        .from("hr_employees")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Empleado eliminado correctamente");
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar empleado: ${error.message}`);
    },
  });
};
