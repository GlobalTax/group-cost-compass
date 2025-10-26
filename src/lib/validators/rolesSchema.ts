import { z } from 'zod';

export const roleSchema = z.enum([
  'super_admin',
  'admin',
  'manager',
  'senior',
  'junior',
  'finance',
]);

export const assignRoleSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
  role: roleSchema,
  orgId: z.string().uuid('ID de organización inválido'),
});

export const revokeRoleSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
  role: roleSchema,
});

export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type RevokeRoleInput = z.infer<typeof revokeRoleSchema>;
