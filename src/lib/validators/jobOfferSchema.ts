import { z } from 'zod';

export const jobOfferSchema = z.object({
  candidate_id: z.string().uuid('ID de candidato inválido').optional(),
  recruitment_process_id: z.string().uuid().optional(),
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  department: z.string().optional(),
  position_level: z.string().optional(),
  candidate_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  candidate_email: z.string().email('Email inválido'),
  candidate_phone: z.string().optional(),
  salary_amount: z.number().min(0, 'El salario debe ser mayor a 0').optional(),
  salary_currency: z.string().default('EUR'),
  salary_period: z.enum(['monthly', 'annual']).default('annual'),
  start_date: z.string().optional(),
  probation_period_months: z.number().min(0).max(12).optional(),
  vacation_days: z.number().min(0).optional(),
  work_schedule: z.string().optional(),
  work_location: z.string().optional(),
  remote_work_allowed: z.boolean().default(false),
  benefits: z.any().optional(),
  requirements: z.any().optional(),
  responsibilities: z.any().optional(),
  additional_notes: z.string().optional(),
});

export const jobOfferFiltersSchema = z.object({
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).optional(),
  candidate_id: z.string().uuid().optional(),
  search: z.string().optional(),
});

export type JobOfferFormData = z.infer<typeof jobOfferSchema>;
export type JobOfferFilters = z.infer<typeof jobOfferFiltersSchema>;
