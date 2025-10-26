import { useUpdateEmployee } from "./useEmployees";
import { employeeSchema } from "@/lib/validators/employeeSchema";
import { toast } from "@/hooks/use-toast";

export const useEmployeeUpdate = (employeeId: string) => {
  const updateEmployee = useUpdateEmployee();

  const updateFields = async (fields: Record<string, any>) => {
    try {
      // Validar campos
      const validation = employeeSchema.partial().safeParse(fields);

      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message || "Datos inválidos";
        toast({
          title: "Error de validación",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }

      // Actualizar en BD
      await updateEmployee.mutateAsync({
        id: employeeId,
        data: fields,
      });

      toast({
        title: "✓ Cambios guardados",
        description: "Los datos se han actualizado correctamente",
      });

      return true;
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios. Intenta de nuevo.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { 
    updateFields, 
    isUpdating: updateEmployee.isPending 
  };
};
