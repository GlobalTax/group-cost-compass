import { z } from 'zod';

export const teamSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  department_id: z.string().uuid('Selecciona un departamento'),
  description: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
  org_id: z.string().uuid(),
});

export type TeamFormData = z.infer<typeof teamSchema>;
