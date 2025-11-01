import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Department = Database['public']['Tables']['departments']['Row'];
type DepartmentInsert = Database['public']['Tables']['departments']['Insert'];
type DepartmentUpdate = Database['public']['Tables']['departments']['Update'];

export type { Department };

export async function fetchDepartments(): Promise<Department[]> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(`Error al obtener departamentos: ${error.message}`);
  return data || [];
}

export async function fetchDepartmentById(id: string): Promise<Department | null> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Error al obtener departamento: ${error.message}`);
  return data;
}

export async function createDepartment(department: DepartmentInsert): Promise<Department> {
  const { data, error } = await supabase
    .from('departments')
    .insert(department)
    .select()
    .single();

  if (error) throw new Error(`Error al crear departamento: ${error.message}`);
  return data;
}

export async function updateDepartment(id: string, updates: DepartmentUpdate): Promise<Department> {
  const { data, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Error al actualizar departamento: ${error.message}`);
  return data;
}

export async function deleteDepartment(id: string): Promise<void> {
  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Error al eliminar departamento: ${error.message}`);
}

export async function checkDepartmentCanBeDeleted(
  id: string
): Promise<{ canDelete: boolean; reason?: string }> {
  // Get department name first
  const department = await fetchDepartmentById(id);
  if (!department) {
    return { canDelete: false, reason: 'Departamento no encontrado' };
  }

  // @ts-ignore - Avoid type recursion in Supabase queries
  const empResult = await supabase
    .from('hr_employees')
    .select('id')
    .eq('department_id', id)
    .is('termination_date', null);

  if (empResult.error) throw new Error(`Error al verificar empleados: ${empResult.error.message}`);

  // @ts-ignore - Avoid type recursion in Supabase queries
  const bandResult = await supabase
    .from('compensation_bands')
    .select('id')
    .eq('department_id', id)
    .eq('is_active', true);

  if (bandResult.error) throw new Error(`Error al verificar bandas salariales: ${bandResult.error.message}`);

  const employeeCount = empResult.data?.length || 0;
  const bandCount = bandResult.data?.length || 0;

  if (employeeCount > 0 || bandCount > 0) {
    return {
      canDelete: false,
      reason: `No se puede eliminar. El departamento tiene ${employeeCount} empleados activos y ${bandCount} bandas salariales activas`,
    };
  }

  return { canDelete: true };
}
