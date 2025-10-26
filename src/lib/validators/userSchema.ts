import { z } from 'zod';
import { roleSchema } from './rolesSchema';

export const inviteUserSchema = z.object({
  email: z.string().email('Email inválido'),
  role: roleSchema,
});

export type InviteUserInput = z.infer<typeof inviteUserSchema>;
