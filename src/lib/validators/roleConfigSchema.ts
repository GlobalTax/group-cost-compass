import { z } from 'zod';

export const roleConfigSchema = z.object({
  display_name: z.string().min(1, 'El nombre de visualización es requerido'),
  description: z.string().optional().nullable(),
  permissions: z.record(z.union([z.boolean(), z.string()])).default({}),
  is_active: z.boolean().default(true),
});

export type RoleConfigInput = z.infer<typeof roleConfigSchema>;
