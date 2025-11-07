import { z } from 'zod';

export const allocationTemplateSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres').max(100, 'Máximo 100 caracteres'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional().nullable(),
  is_default: z.boolean().default(false),
});

export type AllocationTemplateFormData = z.infer<typeof allocationTemplateSchema>;

// Base schema sin refinamiento (para poder usar .omit())
const allocationTemplateItemBaseSchema = z.object({
  template_id: z.string().uuid(),
  employee_id: z.string().uuid().optional().nullable(),
  team_id: z.string().uuid().optional().nullable(),
  allocation_percentage: z.number().min(0.01, 'Mínimo 0.01%').max(100, 'Máximo 100%'),
  allocation_type: z.enum(['originator', 'executor', 'support']).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  display_order: z.number().int().default(0),
});

// Schema con validación (para uso con template_id)
export const allocationTemplateItemSchema = allocationTemplateItemBaseSchema.refine(
  (data) => data.employee_id || data.team_id,
  { message: 'Debe especificar empleado o equipo', path: ['employee_id'] }
);

export type AllocationTemplateItemFormData = z.infer<typeof allocationTemplateItemSchema>;

// Schema para items sin template_id (para creación)
const allocationTemplateItemCreateSchema = allocationTemplateItemBaseSchema
  .omit({ template_id: true })
  .refine(
    (data) => data.employee_id || data.team_id,
    { message: 'Debe especificar empleado o equipo', path: ['employee_id'] }
  );

// Schema completo para crear template con sus items
export const createTemplateWithItemsSchema = z.object({
  template: allocationTemplateSchema,
  items: z.array(allocationTemplateItemCreateSchema)
    .min(1, 'Debe incluir al menos una asignación')
    .refine(
      (items) => {
        const total = items.reduce((sum, item) => sum + item.allocation_percentage, 0);
        return Math.abs(total - 100) < 0.01; // Permitir error de redondeo mínimo
      },
      { message: 'La suma de porcentajes debe ser 100%' }
    ),
});

export type CreateTemplateWithItemsData = z.infer<typeof createTemplateWithItemsSchema>;
