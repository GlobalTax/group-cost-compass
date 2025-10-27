import { z } from 'zod';

export const companySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  nif: z.string()
    .min(9, 'NIF inválido')
    .max(9, 'NIF inválido')
    .regex(/^[A-Z0-9]{9}$/, 'Formato de NIF inválido (debe ser 9 caracteres alfanuméricos)'),
  is_active: z.boolean().default(true),
  founded_date: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  org_id: z.string().uuid(),
});

export type CompanyInput = z.infer<typeof companySchema>;
