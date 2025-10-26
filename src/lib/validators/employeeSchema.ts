import { z } from "zod";

export const employeeSchema = z.object({
  full_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  employee_code: z.string().optional(),
  dni: z.string().optional(),
  nss: z.string().regex(/^[0-9]{11,12}$/, "NSS inválido (11-12 dígitos)").optional().or(z.literal("")),
  birth_date: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().max(500, "Máximo 500 caracteres").optional(),
  company_id: z.string().uuid("Empresa requerida"),
  hire_date: z.string().min(1, "Fecha de alta requerida"),
  termination_date: z.string().optional(),
  seniority_date: z.string().optional(),
  transfer_group: z.boolean().optional(),
  notes: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  contract_type: z.string().optional(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

export const validateEmployee = (data: unknown) => {
  return employeeSchema.safeParse(data);
};
