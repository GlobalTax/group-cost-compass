import { supabase } from '@/lib/supabase/client';
import type { JobOfferCandidate } from './jobOffers.repo';

export async function fetchJobOfferCandidates(jobOfferId: string) {
  const { data, error } = await supabase
    .from('job_offer_candidates')
    .select(`
      *,
      candidate:candidates(id, first_name, last_name, email, phone)
    `)
    .eq('job_offer_id', jobOfferId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as JobOfferCandidate[];
}

export async function associateCandidates(jobOfferId: string, candidateIds: string[]) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;
  if (!userId) throw new Error('No hay sesión activa');

  const { data: user } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', userId)
    .single();

  if (!user?.org_id) throw new Error('Usuario sin organización');

  const associations = candidateIds.map((candidateId) => ({
    org_id: user.org_id,
    job_offer_id: jobOfferId,
    candidate_id: candidateId,
    status: 'pending',
  }));

  const { data, error } = await supabase
    .from('job_offer_candidates')
    .insert(associations)
    .select();

  if (error) throw error;
  return data as JobOfferCandidate[];
}

export async function removeJobOfferCandidate(id: string) {
  const { error } = await supabase
    .from('job_offer_candidates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function updateJobOfferCandidateStatus(
  id: string,
  status: string,
  additionalData?: Partial<JobOfferCandidate>
) {
  const updateData: any = { status, ...additionalData };

  if (status === 'sent') {
    updateData.sent_at = new Date().toISOString();
  } else if (status === 'accepted') {
    updateData.accepted_at = new Date().toISOString();
  } else if (status === 'rejected') {
    updateData.rejected_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('job_offer_candidates')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as JobOfferCandidate;
}

export async function uploadCandidatePDF(file: File, jobOfferCandidateId: string) {
  const fileExt = file.name.split('.').pop();
  const filePath = `job-offer-candidates/${jobOfferCandidateId}/offer-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('candidate-documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('candidate-documents')
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from('job_offer_candidates')
    .update({ pdf_url: urlData.publicUrl })
    .eq('id', jobOfferCandidateId);

  if (updateError) throw updateError;

  return urlData.publicUrl;
}
