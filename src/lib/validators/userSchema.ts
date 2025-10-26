import { z } from 'zod';
import { roleSchema } from './rolesSchema';

export const inviteUserSchema = z.object({
  email: z.string().email('Email inválido'),
  role: roleSchema,
  orgId: z.string().uuid('ID de organización inválido').optional(),
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
