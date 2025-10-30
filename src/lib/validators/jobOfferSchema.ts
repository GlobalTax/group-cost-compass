import { z } from 'zod';

export const jobOfferSchema = z.object({
  // Información básica (candidato ahora opcional)
  candidate_id: z.string().uuid('ID de candidato inválido').optional(),
  recruitment_process_id: z.string().uuid().optional(),
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  department: z.string().optional(),
  position_level: z.string().optional(),
  work_location: z.string().optional(),
  start_date: z.string().optional(),
  
  // Retribución (campos flexibles)
  salary_base: z.number().min(0, 'El salario base debe ser mayor a 0'),
  bonus_amount: z.number().min(0).optional(),
  bonus_conditions: z.string().optional(),
  exclusivity_compensation: z.number().min(0).optional(),
  exclusivity_percentage: z.number().min(0).max(100, 'El porcentaje debe estar entre 0 y 100').optional(),
  salary_currency: z.string().default('EUR'),
  
  // Contrato
  contract_type: z.string().default('indefinido'),
  contract_duration: z.string().optional(),
  probation_duration: z.string().optional(),
  weekly_hours: z.number().min(0).default(40),
  
  // Beneficios y gastos
  vacation_days: z.number().min(0).optional(),
  remote_work_allowed: z.boolean().default(false),
  expense_reimbursement: z.string().optional(),
  other_benefits: z.any().optional(),
  
  // Pactos legales
  exclusivity_clause: z.string().optional(),
  non_compete_clause: z.string().optional(),
  
  // Otros
  work_schedule: z.string().optional(),
  additional_notes: z.string().optional(),
});

export const jobOfferFiltersSchema = z.object({
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).optional(),
  candidate_id: z.string().uuid().optional(),
  search: z.string().optional(),
});

export type JobOfferFormData = z.infer<typeof jobOfferSchema>;
export type JobOfferFilters = z.infer<typeof jobOfferFiltersSchema>;
