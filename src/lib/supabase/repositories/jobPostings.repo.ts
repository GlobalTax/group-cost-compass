import { supabase } from '@/lib/supabase/client';
import type { JobPostingFilters } from '@/lib/validators/jobPostingSchema';

export interface JobPosting {
  id: string;
  org_id: string;
  title: string;
  department: string | null;
  location: string | null;
  remote_work_allowed: boolean;
  employment_type: string | null;
  position_level: string | null;
  description: string | null;
  responsibilities: string[];
  requirements: {
    education?: string[];
    experience_years?: number;
    skills?: string[];
    languages?: string[];
  };
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  benefits: string[];
  status: 'draft' | 'published' | 'closed';
  published_at: string | null;
  closed_at: string | null;
  target_start_date: string | null;
  hiring_manager_id: string | null;
  recruiter_id: string | null;
  vacancies_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  candidates_count?: number;
}

export async function fetchJobPostings(filters?: JobPostingFilters) {
  let query = supabase
    .from('job_postings')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.department) {
    query = query.eq('department', filters.department);
  }

  if (filters?.employment_type) {
    query = query.eq('employment_type', filters.employment_type);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Fetch candidates count for each posting
  const postingsWithCount = await Promise.all(
    (data || []).map(async (posting: any) => {
      const { count } = await supabase
        .from('recruitment_processes')
        .select('*', { count: 'exact', head: true })
        .eq('job_posting_id', posting.id);

      return {
        ...posting,
        candidates_count: count || 0,
      };
    })
  );

  return postingsWithCount as JobPosting[];
}

export async function fetchJobPostingById(id: string) {
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as JobPosting;
}

export async function createJobPosting(data: Partial<JobPosting>) {
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
    .from('job_postings')
    .insert({
      ...data,
      org_id: user.org_id,
      created_by: userId,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return result as JobPosting;
}

export async function updateJobPosting(id: string, data: Partial<JobPosting>) {
  const { data: result, error } = await supabase
    .from('job_postings')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result as JobPosting;
}

export async function publishJobPosting(id: string) {
  const { data, error } = await supabase
    .from('job_postings')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as JobPosting;
}

export async function closeJobPosting(id: string) {
  const { data, error } = await supabase
    .from('job_postings')
    .update({
      status: 'closed',
      closed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as JobPosting;
}

export async function deleteJobPosting(id: string) {
  const { error } = await supabase
    .from('job_postings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function duplicateJobPosting(id: string) {
  const original = await fetchJobPostingById(id);
  
  const { id: _, created_at, updated_at, published_at, closed_at, ...duplicateData } = original;
  
  return createJobPosting({
    ...duplicateData,
    title: `${original.title} (Copia)`,
    status: 'draft',
    published_at: null,
    closed_at: null,
  });
}
