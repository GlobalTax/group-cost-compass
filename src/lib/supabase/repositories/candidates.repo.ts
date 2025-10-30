import { supabase } from '@/lib/supabase/client';
import type { CandidateFilters } from '@/lib/validators/candidateSchema';

export interface Candidate {
  id: string;
  org_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  linkedin_url: string | null;
  current_company: string | null;
  current_position: string | null;
  years_experience: number;
  skills: string[];
  languages: string[];
  location: string | null;
  remote_work_preference: string;
  expected_salary: number | null;
  salary_currency: string;
  availability_date: string | null;
  source: string;
  status: string;
  notes: string | null;
  cv_file_path: string | null;
  cover_letter: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export async function fetchCandidates(filters?: CandidateFilters) {
  let query = supabase
    .from('candidates')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.source) {
    query = query.eq('source', filters.source);
  }

  if (filters?.skills && filters.skills.length > 0) {
    query = query.contains('skills', filters.skills);
  }

  if (filters?.search) {
    query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Candidate[];
}

export async function fetchCandidateById(id: string) {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Candidate;
}

export async function createCandidate(data: Partial<Candidate>) {
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
    .from('candidates')
    .insert({
      ...data,
      org_id: user.org_id,
      created_by: userId,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return result as Candidate;
}

export async function updateCandidate(id: string, data: Partial<Candidate>) {
  const { data: result, error } = await supabase
    .from('candidates')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result as Candidate;
}

export async function deleteCandidate(id: string) {
  const { error } = await supabase
    .from('candidates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function uploadCV(file: File, candidateId: string) {
  const fileExt = file.name.split('.').pop();
  const filePath = `cvs/${candidateId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('candidate-documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Update candidate with CV path
  const { error: updateError } = await supabase
    .from('candidates')
    .update({ cv_file_path: filePath })
    .eq('id', candidateId);

  if (updateError) throw updateError;

  return filePath;
}
