import { z } from 'zod';

export const systemSettingSchema = z.object({
  setting_key: z.string().min(1, 'La clave es requerida'),
  setting_value: z.record(z.any()),
  description: z.string().optional().nullable(),
  setting_category: z.string().default('general'),
  org_id: z.string().uuid(),
});

export type SystemSettingInput = z.infer<typeof systemSettingSchema>;
