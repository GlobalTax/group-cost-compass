import { useUpdateEmployee } from "./useEmployees";
import { employeeSchema } from "@/lib/validators/employeeSchema";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { createAuditLog } from "@/lib/supabase/repositories/audit.repo";

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

      // Si cambia company_id, registrar en auditoría
      if (cleanFields.company_id) {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: employee } = await supabase
          .from("hr_employees")
          .select("company_id, full_name, org_id")
          .eq("id", employeeId)
          .single();

        if (employee && employee.company_id !== cleanFields.company_id) {
          const reason = (window as any).__companyChangeReason || "Corrección administrativa";
          
          // Obtener nombres de empresas
          const { data: companies } = await supabase
            .from("companies")
            .select("id, name")
            .in("id", [employee.company_id, cleanFields.company_id]);
          
          const fromCompany = companies?.find(c => c.id === employee.company_id)?.name;
          const toCompany = companies?.find(c => c.id === cleanFields.company_id)?.name;

          await createAuditLog({
            user_id: user?.id || null,
            table_name: "hr_employees",
            record_id: employeeId,
            action: "update",
            old_data: { 
              company_id: employee.company_id,
              company_name: fromCompany 
            },
            new_data: { 
              company_id: cleanFields.company_id,
              company_name: toCompany,
              reason: reason
            },
          });

          // Limpiar motivo temporal
          delete (window as any).__companyChangeReason;
        }
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
      const errorMessage = error instanceof Error 
        ? error.message 
        : "No se pudieron guardar los cambios. Intenta de nuevo.";
      
      toast({
        title: "Error al guardar",
        description: errorMessage,
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
