import { z } from "zod";

export const employeeSchema = z.object({
  full_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  dni: z.string().optional(),
  company_id: z.string().uuid("Empresa requerida"),
  hire_date: z.string().min(1, "Fecha de alta requerida"),
  termination_date: z.string().optional(),
  seniority_date: z.string().optional(),
  transfer_group: z.boolean().optional(),
  notes: z.string().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

export const validateEmployee = (data: unknown) => {
  return employeeSchema.safeParse(data);
};
