import { z } from "zod";

export const employeeSchema = z.object({
  full_name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  employee_code: z.string().optional(),
  dni: z.string().optional(),
  nss: z.string().regex(/^(?:\d{11,12}|\d{2}\/\d{8}-\d{2})$/, "NSS inválido (formato: 11-12 dígitos o 00/00000000-00)").optional().or(z.literal("")),
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
  annual_salary: z.number().min(0, "El salario debe ser positivo").optional(),
  department_id: z.string().uuid().optional().nullable(),
  team_id: z.string().uuid().optional().nullable(),
  employment_status: z.enum([
    'active',
    'leave_of_absence',
    'maternity_leave',
    'paternity_leave',
    'medical_leave',
    'sabbatical',
    'unpaid_leave',
    'suspended',
    'terminated'
  ]).optional().default('active'),
  leave_start_date: z.string().optional().nullable(),
  leave_end_date: z.string().optional().nullable(),
  leave_reason: z.string().max(500, "Máximo 500 caracteres").optional().nullable(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;

export const validateEmployee = (data: unknown) => {
  return employeeSchema.safeParse(data);
};

// Schema para actualización de salario
export const salaryUpdateSchema = z.object({
  employeeId: z.string().uuid("ID de empleado inválido"),
  newSalary: z
    .number()
    .min(0, "El salario no puede ser negativo")
    .max(500000, "El salario excede el límite permitido (500.000€)")
    .int("El salario debe ser un número entero"),
});

export type SalaryUpdateData = z.infer<typeof salaryUpdateSchema>;
