import { supabase } from '@/lib/supabase/client';

export interface JobOffer {
  id: string;
  org_id: string;
  candidate_id: string | null;
  recruitment_process_id: string | null;
  title: string;
  department: string | null;
  position_level: string | null;
  candidate_name: string;
  candidate_email: string;
  candidate_phone: string | null;
  salary_amount: number | null;
  salary_currency: string | null;
  salary_period: string | null;
  start_date: string | null;
  probation_period_months: number | null;
  vacation_days: number | null;
  work_schedule: string | null;
  work_location: string | null;
  remote_work_allowed: boolean | null;
  benefits: any;
  requirements: any;
  responsibilities: any;
  additional_notes: string | null;
  status: string;
  template_id: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  responded_at: string | null;
  expires_at: string | null;
  employee_onboarding_id: string | null;
  access_token: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  candidate?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface JobOfferFilters {
  status?: string;
  candidate_id?: string;
  search?: string;
}

export async function fetchJobOffers(filters?: JobOfferFilters) {
  let query = supabase
    .from('job_offers')
    .select(`
      *,
      candidate:candidates(id, first_name, last_name, email)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.candidate_id) {
    query = query.eq('candidate_id', filters.candidate_id);
  }

  if (filters?.search) {
    query = query.or(`position_title.ilike.%${filters.search}%,candidate_email.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as JobOffer[];
}

export async function fetchJobOfferById(id: string) {
  const { data, error } = await supabase
    .from('job_offers')
    .select(`
      *,
      candidate:candidates(id, first_name, last_name, email, phone, linkedin_url)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as JobOffer;
}

export async function createJobOffer(data: Partial<JobOffer>) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;

  if (!userId) throw new Error('No hay sesión activa');

  const { data: user } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', userId)
    .single();

  if (!user?.org_id) throw new Error('Usuario sin organización');

  const { data: result, error } = await supabase
    .from('job_offers')
    .insert({
      ...data,
      org_id: user.org_id,
      created_by: userId,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return result as JobOffer;
}

export async function updateJobOffer(id: string, data: Partial<JobOffer>) {
  const { data: result, error } = await supabase
    .from('job_offers')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result as JobOffer;
}

export async function sendJobOffer(id: string) {
  const { data, error } = await supabase
    .from('job_offers')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as JobOffer;
}

export async function acceptJobOffer(id: string) {
  const { data, error } = await supabase
    .from('job_offers')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as JobOffer;
}

export async function rejectJobOffer(id: string, reason?: string) {
  const { data, error } = await supabase
    .from('job_offers')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as JobOffer;
}

export async function deleteJobOffer(id: string) {
  const { error } = await supabase
    .from('job_offers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadOfferPDF(file: File, offerId: string, type: 'offer' | 'signed') {
  const fileExt = file.name.split('.').pop();
  const filePath = `job-offers/${offerId}/${type}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('candidate-documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('candidate-documents')
    .getPublicUrl(filePath);

  // Update job offer with PDF path
  const updateField = type === 'offer' ? 'offer_pdf_url' : 'signed_pdf_url';
  const { error: updateError } = await supabase
    .from('job_offers')
    .update({ [updateField]: urlData.publicUrl })
    .eq('id', offerId);

  if (updateError) throw updateError;

  return urlData.publicUrl;
}
