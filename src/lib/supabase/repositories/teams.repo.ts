import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type Team = Database['public']['Tables']['teams']['Row'];
export type TeamInsert = Database['public']['Tables']['teams']['Insert'];
export type TeamUpdate = Database['public']['Tables']['teams']['Update'];

export interface TeamWithDepartment extends Team {
  departments: { name: string } | null;
  member_count?: number;
}

export async function fetchTeams(filters?: { departmentId?: string }): Promise<TeamWithDepartment[]> {
  let query = supabase
    .from('teams')
    .select(`
      *,
      departments(name),
      hr_employees!team_id(count)
    `)
    .eq('is_active', true)
    .order('name');

  if (filters?.departmentId) {
    query = query.eq('department_id', filters.departmentId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as TeamWithDepartment[];
}

export async function createTeam(team: TeamInsert): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .insert(team)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTeam(id: string, updates: Record<string, any>): Promise<Team> {
  const { data, error} = await supabase
    .from('teams')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTeam(id: string): Promise<void> {
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
