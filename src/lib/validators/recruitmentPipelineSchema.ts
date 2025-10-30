import { z } from 'zod';

export const pipelineStageSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  color: z.string().default('#6366f1'),
  icon: z.string().optional(),
  description: z.string().optional(),
  sort_order: z.number().min(0).default(0),
});

export const recruitmentProcessSchema = z.object({
  candidate_id: z.string().uuid('ID de candidato inválido'),
  job_posting_id: z.string().uuid('ID de vacante inválido').optional(),
  position_title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  current_stage: z.string().uuid('Etapa inválida').optional(),
  status: z.enum(['active', 'hired', 'rejected', 'on_hold']).default('active'),
  department: z.string().optional(),
  budget_min: z.number().min(0).optional(),
  budget_max: z.number().min(0).optional(),
  target_start_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  stage_deadline: z.string().optional(),
  hiring_manager_id: z.string().uuid().optional(),
  recruiter_id: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export type PipelineStageFormData = z.infer<typeof pipelineStageSchema>;
export type RecruitmentProcessFormData = z.infer<typeof recruitmentProcessSchema>;
