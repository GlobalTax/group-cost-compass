import { z } from 'zod';

// Schema para revenue_items
export const revenueItemSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato debe ser YYYY-MM-DD'),
  company_id: z.string().uuid('Empresa requerida'),
  description: z.string().min(3, 'Mínimo 3 caracteres').max(500, 'Máximo 500 caracteres'),
  category: z.string().optional().nullable(),
  total_amount: z.number().nonnegative('El importe debe ser >= 0'),
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.string().optional().nullable(),
  client_name: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type RevenueItemFormData = z.infer<typeof revenueItemSchema>;

// Schema para revenue_allocations
export const revenueAllocationSchema = z.object({
  revenue_item_id: z.string().uuid(),
  employee_id: z.string().uuid().optional().nullable(),
  team_id: z.string().uuid().optional().nullable(),
  allocated_amount: z.number().nonnegative().optional().nullable(),
  allocation_percentage: z.number().min(0).max(100).optional().nullable(),
  allocation_type: z.enum(['originator', 'executor', 'support']).optional().nullable(),
  notes: z.string().optional().nullable(),
}).refine(
  (data) => data.employee_id || data.team_id,
  { message: 'Debe especificar empleado o equipo', path: ['employee_id'] }
).refine(
  (data) => data.allocated_amount !== null || data.allocation_percentage !== null,
  { message: 'Debe especificar importe o porcentaje', path: ['allocated_amount'] }
);

export type RevenueAllocationFormData = z.infer<typeof revenueAllocationSchema>;

// Schema para subida CSV
export const uploadRevenueRowSchema = z.object({
  period: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'Formato debe ser YYYY-MM o YYYY-MM-DD'),
  company: z.string().min(1, 'Empresa requerida'),
  description: z.string().min(3, 'Descripción requerida'),
  category: z.string().optional(),
  total_amount: z.number().nonnegative('Importe debe ser >= 0'),
  is_recurring: z.boolean().optional(),
  client_name: z.string().optional(),
  // Campos de asignación (opcional en CSV)
  employee_name: z.string().optional(),
  team_name: z.string().optional(),
  allocated_amount: z.number().optional(),
  allocation_percentage: z.number().min(0).max(100).optional(),
  allocation_type: z.enum(['originator', 'executor', 'support']).optional(),
});

export type UploadRevenueRow = z.infer<typeof uploadRevenueRowSchema>;
