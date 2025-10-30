import { supabase } from '@/lib/supabase/client';

export interface PipelineStage {
  id: string;
  org_id: string;
  name: string;
  color: string;
  icon: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecruitmentProcess {
  id: string;
  org_id: string;
  candidate_id: string;
  job_posting_id: string | null;
  current_stage: string | null;
  status: string;
  position_title: string;
  department: string | null;
  budget_min: number | null;
  budget_max: number | null;
  target_start_date: string | null;
  priority: string | null;
  stage_deadline: string | null;
  hiring_manager_id: string | null;
  recruiter_id: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  candidate?: any;
  job_posting?: any;
  stage?: PipelineStage;
}

export async function fetchPipelineStages() {
  const { data, error } = await supabase
    .from('recruitment_pipeline_stages')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data as PipelineStage[];
}

export async function createPipelineStage(data: Partial<PipelineStage>) {
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
    .from('recruitment_pipeline_stages')
    .insert({
      ...data,
      org_id: user.org_id,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return result as PipelineStage;
}

export async function updatePipelineStage(id: string, data: Partial<PipelineStage>) {
  const { data: result, error } = await supabase
    .from('recruitment_pipeline_stages')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result as PipelineStage;
}

export async function deletePipelineStage(id: string) {
  const { error } = await supabase
    .from('recruitment_pipeline_stages')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function fetchProcessesByStage(stageId: string) {
  const { data, error } = await supabase
    .from('recruitment_processes')
    .select(`
      *,
      candidate:candidates(*),
      job_posting:job_postings(*)
    `)
    .eq('current_stage', stageId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  // Fetch stage details separately
  if (data && data.length > 0) {
    const { data: stage } = await supabase
      .from('recruitment_pipeline_stages')
      .select('*')
      .eq('id', stageId)
      .single();
    
    return data.map(process => ({
      ...process,
      stage,
    })) as RecruitmentProcess[];
  }
  
  return data as RecruitmentProcess[];
}

export async function fetchAllActiveProcesses() {
  const { data, error } = await supabase
    .from('recruitment_processes')
    .select(`
      *,
      candidate:candidates(*),
      job_posting:job_postings(*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as RecruitmentProcess[];
}

export async function createRecruitmentProcess(data: Partial<RecruitmentProcess>) {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;

  if (!userId) throw new Error('No hay sesión activa');

  const { data: user } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', userId)
    .single();

  if (!user?.org_id) throw new Error('Usuario sin organización');

  // Get first stage
  const { data: stages } = await supabase
    .from('recruitment_pipeline_stages')
    .select('id')
    .eq('org_id', user.org_id)
    .order('sort_order', { ascending: true })
    .limit(1);

  const { data: result, error } = await supabase
    .from('recruitment_processes')
    .insert({
      ...data,
      org_id: user.org_id,
      created_by: userId,
      current_stage: data.current_stage || stages?.[0]?.id || null,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return result as RecruitmentProcess;
}

export async function moveProcessToStage(processId: string, newStageId: string) {
  const { data, error } = await supabase
    .from('recruitment_processes')
    .update({ current_stage: newStageId })
    .eq('id', processId)
    .select()
    .single();

  if (error) throw error;
  return data as RecruitmentProcess;
}

export async function updateRecruitmentProcess(id: string, data: Partial<RecruitmentProcess>) {
  const { data: result, error } = await supabase
    .from('recruitment_processes')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result as RecruitmentProcess;
}

export async function fetchProcessById(id: string) {
  const { data, error } = await supabase
    .from('recruitment_processes')
    .select(`
      *,
      candidate:candidates(*),
      job_posting:job_postings(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  
  // Fetch stage details separately if there's a current_stage
  if (data && data.current_stage) {
    const { data: stage } = await supabase
      .from('recruitment_pipeline_stages')
      .select('*')
      .eq('id', data.current_stage)
      .single();
    
    return {
      ...data,
      stage,
    } as RecruitmentProcess;
  }
  
  return data as RecruitmentProcess;
}
