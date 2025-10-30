import { z } from 'zod';

export const jobPostingSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(200),
  department: z.string().optional(),
  location: z.string().optional(),
  remote_work_allowed: z.boolean().default(false),
  employment_type: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
  position_level: z.enum(['junior', 'mid', 'senior', 'lead', 'director']).optional(),
  description: z.string().optional(),
  responsibilities: z.array(z.string()).default([]),
  requirements: z.object({
    education: z.array(z.string()).optional(),
    experience_years: z.number().min(0).optional(),
    skills: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
  }).optional(),
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  salary_currency: z.string().default('EUR'),
  benefits: z.array(z.string()).default([]),
  target_start_date: z.string().optional(),
  hiring_manager_id: z.string().uuid().optional(),
  recruiter_id: z.string().uuid().optional(),
  vacancies_count: z.number().min(1).default(1),
});

export const jobPostingFiltersSchema = z.object({
  status: z.enum(['draft', 'published', 'closed']).optional(),
  department: z.string().optional(),
  employment_type: z.string().optional(),
  search: z.string().optional(),
});

export type JobPostingFormData = z.infer<typeof jobPostingSchema>;
export type JobPostingFilters = z.infer<typeof jobPostingFiltersSchema>;
