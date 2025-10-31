import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex válido requerido (#RRGGBB)').default('#6366f1'),
  manager_user_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().default(true),
  org_id: z.string().uuid(),
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;
