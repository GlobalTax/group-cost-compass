import { z } from 'zod';

// Schema para datos personales
export const personalDataSchema = z.object({
  full_name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  dni_nie: z.string().min(8, 'DNI/NIE inválido'),
  birth_date: z.string().optional(),
  nationality: z.string().optional(),
  photo_url: z.string().url().optional().or(z.literal('')),
});

// Schema para datos de contacto
export const contactDataSchema = z.object({
  address: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

// Schema para datos bancarios
export const bankingDataSchema = z.object({
  iban: z.string().regex(/^[A-Z]{2}\d{22}$/, 'IBAN inválido (formato: ES1234567890123456789012)').optional().or(z.literal('')),
  bank_name: z.string().optional(),
  account_holder: z.string().optional(),
});

// Schema para datos laborales
export const jobDataSchema = z.object({
  position_title: z.string().min(2, 'El puesto es requerido'),
  department_id: z.string().uuid().optional(),
  expected_start_date: z.string().optional(),
  salary: z.number().optional(),
  contract_type: z.string().optional(),
});

// Schema para creación de onboarding
export const createOnboardingSchema = z.object({
  email: z.string().email('Email inválido'),
  position_title: z.string().min(2, 'El puesto es requerido'),
  department_id: z.string().uuid().optional().nullable(),
  job_offer_id: z.string().uuid().optional().nullable(),
  expected_start_date: z.string().optional(),
});

// Schema para actualización de onboarding
export const updateOnboardingSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'expired']).optional(),
  current_step: z.number().min(1).max(7).optional(),
  personal_data: personalDataSchema.optional(),
  contact_data: contactDataSchema.optional(),
  banking_data: bankingDataSchema.optional(),
  notes: z.string().optional(),
});

// Schema para subida de documentos
export const documentUploadSchema = z.object({
  document_type: z.string().min(2, 'El tipo de documento es requerido'),
  file_url: z.string().url('URL inválida'),
  file_name: z.string().min(1, 'El nombre del archivo es requerido'),
  file_size: z.number().optional(),
});

// Schema para filtros
export const onboardingFiltersSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'expired', 'all']).optional(),
  search: z.string().optional(),
  department_id: z.string().uuid().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

// Tipos TypeScript
export type PersonalData = z.infer<typeof personalDataSchema>;
export type ContactData = z.infer<typeof contactDataSchema>;
export type BankingData = z.infer<typeof bankingDataSchema>;
export type JobData = z.infer<typeof jobDataSchema>;
export type CreateOnboarding = z.infer<typeof createOnboardingSchema>;
export type UpdateOnboarding = z.infer<typeof updateOnboardingSchema>;
export type DocumentUpload = z.infer<typeof documentUploadSchema>;
export type OnboardingFilters = z.infer<typeof onboardingFiltersSchema>;
