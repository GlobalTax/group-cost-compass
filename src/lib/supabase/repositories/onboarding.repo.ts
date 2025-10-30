import { supabase } from '@/lib/supabase/client';
import type { CreateOnboarding, UpdateOnboarding, OnboardingFilters } from '@/lib/validators/onboardingSchema';

export interface OnboardingRecord {
  id: string;
  org_id: string;
  job_offer_id: string | null;
  email: string;
  position_title: string;
  department_id: string | null;
  token: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  current_step: number;
  personal_data: any;
  contact_data: any;
  banking_data: any;
  documents: any;
  expires_at: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface OnboardingDocument {
  id: string;
  onboarding_id: string;
  document_name: string;
  pdf_url: string;
  status: string;
  requires_signature: boolean;
  signed_at: string;
  created_at: string;
}

/**
 * Obtener todos los onboardings con filtros
 */
export async function fetchOnboardings(filters?: OnboardingFilters) {
  let query = supabase
    .from('employee_onboarding')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.search) {
    query = query.or(`email.ilike.%${filters.search}%,position_title.ilike.%${filters.search}%`);
  }

  if (filters?.department_id) {
    query = query.eq('department_id', filters.department_id);
  }

  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from);
  }

  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as any as OnboardingRecord[];
}

/**
 * Obtener un onboarding por ID
 */
export async function fetchOnboardingById(id: string) {
  const { data, error } = await supabase
    .from('employee_onboarding')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as any as OnboardingRecord;
}

/**
 * Obtener un onboarding por token (para acceso público)
 */
export async function fetchOnboardingByToken(token: string) {
  const { data, error } = await supabase
    .from('employee_onboarding')
    .select('*')
    .eq('token', token)
    .single();

  if (error) throw error;
  return data as any as OnboardingRecord;
}

/**
 * Crear un nuevo onboarding
 */
export async function createOnboarding(onboarding: CreateOnboarding) {
  const payload: any = {
    email: onboarding.email,
    position_title: onboarding.position_title,
  };

  if (onboarding.department_id) {
    payload.department_id = onboarding.department_id;
  }
  if (onboarding.job_offer_id) {
    payload.job_offer_id = onboarding.job_offer_id;
  }

  const { data, error } = await supabase
    .from('employee_onboarding')
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as any as OnboardingRecord;
}

/**
 * Actualizar un onboarding
 */
export async function updateOnboarding(id: string, updates: UpdateOnboarding) {
  const { data, error } = await supabase
    .from('employee_onboarding')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as any as OnboardingRecord;
}

/**
 * Actualizar paso específico del onboarding
 */
export async function updateOnboardingStep(
  id: string, 
  step: number, 
  stepData: Record<string, any>
) {
  const updates: Record<string, any> = {
    current_step: step,
    updated_at: new Date().toISOString(),
  };

  // Mapear datos según el paso
  if (step === 2) {
    updates.personal_data = stepData;
  } else if (step === 3) {
    updates.contact_data = stepData;
  } else if (step === 4) {
    updates.banking_data = stepData;
  }

  // Si está avanzando, actualizar status a in_progress
  if (step > 1) {
    updates.status = 'in_progress';
  }

  return updateOnboarding(id, updates);
}

/**
 * Completar onboarding
 */
export async function completeOnboarding(id: string) {
  const { data, error } = await supabase
    .from('employee_onboarding')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      current_step: 7,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as any as OnboardingRecord;
}

/**
 * Eliminar onboarding
 */
export async function deleteOnboarding(id: string) {
  const { error } = await supabase
    .from('employee_onboarding')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Obtener documentos de un onboarding
 */
export async function fetchOnboardingDocuments(onboardingId: string) {
  const { data, error } = await supabase
    .from('employee_onboarding_documents')
    .select('*')
    .eq('onboarding_id', onboardingId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as OnboardingDocument[];
}

/**
 * Registrar documento subido
 */
export async function createOnboardingDocument(
  onboardingId: string,
  document: {
    document_name: string;
    pdf_url?: string;
    status?: string;
    requires_signature?: boolean;
  }
) {
  const { data: user } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('employee_onboarding_documents')
    .insert([{
      onboarding_id: onboardingId,
      org_id: user?.user?.user_metadata?.org_id || '00000000-0000-0000-0000-000000000000',
      document_name: document.document_name,
      pdf_url: document.pdf_url || '',
      status: document.status || 'pending',
      requires_signature: document.requires_signature || false,
      template_id: '00000000-0000-0000-0000-000000000000',
      content: '',
    }])
    .select()
    .single();

  if (error) throw error;
  return data as any as OnboardingDocument;
}

/**
 * Obtener estadísticas de onboarding
 */
export async function fetchOnboardingStats() {
  const { data, error } = await supabase
    .from('employee_onboarding')
    .select('status, created_at, completed_at');

  if (error) throw error;

  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const stats = {
    total: data.length,
    pending: data.filter(o => o.status === 'pending').length,
    inProgress: data.filter(o => o.status === 'in_progress').length,
    completed: data.filter(o => o.status === 'completed').length,
    expired: data.filter(o => o.status === 'expired').length,
    completedThisMonth: data.filter(o => 
      o.status === 'completed' && 
      o.completed_at && 
      new Date(o.completed_at) >= firstDayOfMonth
    ).length,
  };

  return stats;
}
