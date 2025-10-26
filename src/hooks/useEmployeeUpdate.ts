import { useUpdateEmployee } from "./useEmployees";
import { employeeSchema } from "@/lib/validators/employeeSchema";
import { toast } from "@/hooks/use-toast";

// Sanear campos: convertir strings vacíos a null para campos opcionales
const sanitizeFields = (fields: Record<string, any>): Record<string, any> => {
  const nullableKeys = [
    "dni", "nss", "email", "phone", "address",
    "department", "position", "contract_type", "employee_code",
    "birth_date", "termination_date", "seniority_date", "notes"
  ];

  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(fields)) {
    if (nullableKeys.includes(key) && typeof value === "string") {
      const trimmed = value.trim();
      sanitized[key] = trimmed === "" ? null : trimmed;
    } else if (typeof value === "string") {
      sanitized[key] = value.trim();
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

export const useEmployeeUpdate = (employeeId: string) => {
  const updateEmployee = useUpdateEmployee();

  const updateFields = async (fields: Record<string, any>) => {
    try {
      // Sanear campos antes de validar
      const cleanFields = sanitizeFields(fields);
      
      // Validar campos
      const validation = employeeSchema.partial().safeParse(cleanFields);

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
        data: cleanFields,
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
