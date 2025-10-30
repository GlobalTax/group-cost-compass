import { z } from 'zod';

export const candidateSchema = z.object({
  first_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  last_name: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  linkedin_url: z.string().url('URL inválida').optional().or(z.literal('')),
  current_company: z.string().optional(),
  current_position: z.string().optional(),
  years_experience: z.number().min(0).default(0),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  location: z.string().optional(),
  remote_work_preference: z.enum(['remote', 'hybrid', 'office']).default('hybrid'),
  expected_salary: z.number().min(0).optional(),
  salary_currency: z.string().default('EUR'),
  availability_date: z.string().optional(),
  source: z.enum(['linkedin', 'referral', 'website', 'job_board', 'headhunter', 'manual']).default('manual'),
  notes: z.string().optional(),
  cv_file_path: z.string().optional(),
});

export const candidateFiltersSchema = z.object({
  status: z.enum(['new', 'in_process', 'hired', 'rejected', 'on_hold']).optional(),
  skills: z.array(z.string()).optional(),
  source: z.string().optional(),
  search: z.string().optional(),
});

export type CandidateFormData = z.infer<typeof candidateSchema>;
export type CandidateFilters = z.infer<typeof candidateFiltersSchema>;
