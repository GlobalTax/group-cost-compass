/**
 * Repositorio para operaciones con empleados
 * Centraliza queries y lógica de negocio
 */

import { supabase } from "../client";
import type { Database } from "@/integrations/supabase/types";

type Employee = Database["public"]["Tables"]["hr_employees"]["Row"];
type EmployeeInsert = Database["public"]["Tables"]["hr_employees"]["Insert"];
type EmployeeUpdate = Database["public"]["Tables"]["hr_employees"]["Update"];

/**
 * Obtiene todos los empleados con filtros opcionales
 */
export const fetchEmployees = async (filters?: {
  companyId?: string;
  departmentId?: string;
  teamId?: string;
  searchTerm?: string;
  activeOnly?: boolean;
  withoutTeam?: boolean;
}): Promise<Employee[]> => {
  let query = supabase
    .from("hr_employees")
    .select(
      `
      *,
      companies (
        id,
        name,
        nif
      )
    `
    )
    .order("full_name");

  if (filters?.companyId) {
    query = query.eq("company_id", filters.companyId);
  }

  if (filters?.departmentId) {
    query = query.eq("department_id", filters.departmentId);
  }

  if (filters?.teamId) {
    query = query.eq("team_id", filters.teamId);
  }

  if (filters?.withoutTeam) {
    query = query.is("team_id", null);
  }

  if (filters?.searchTerm) {
    query = query.or(
      `full_name.ilike.%${filters.searchTerm}%,dni.ilike.%${filters.searchTerm}%`
    );
  }

  if (filters?.activeOnly === true) {
    query = query.is("termination_date", null);
  } else if (filters?.activeOnly === false) {
    query = query.not("termination_date", "is", null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

/**
 * Obtiene un empleado por ID
 */
export const fetchEmployeeById = async (id: string): Promise<Employee | null> => {
  const { data, error } = await supabase
    .from("hr_employees")
    .select(
      `
      *,
      companies (
        id,
        name,
        nif
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
};

/**
 * Crea un nuevo empleado
 */
export const createEmployee = async (data: EmployeeInsert): Promise<Employee> => {
  const { data: employee, error } = await supabase
    .from("hr_employees")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return employee;
};

/**
 * Actualiza un empleado existente
 */
export const updateEmployee = async (
  id: string,
  data: EmployeeUpdate
): Promise<Employee> => {
  const { data: employee, error } = await supabase
    .from("hr_employees")
    .update(data)
    .eq("id", id)
    .select(
      `
      *,
      companies (
        id,
        name,
        nif
      )
    `
    )
    .maybeSingle();

  if (error) throw error;
  if (!employee) {
    throw new Error("Sin permisos o registro no existe");
  }

  return employee;
};

/**
 * Elimina un empleado
 */
export const deleteEmployee = async (id: string): Promise<void> => {
  const { error } = await supabase.from("hr_employees").delete().eq("id", id);

  if (error) throw error;
};

/**
 * Verifica si un empleado puede ser eliminado
 */
export const checkEmployeeCanBeDeleted = async (
  id: string
): Promise<{ canDelete: boolean; reason?: string }> => {
  // Verificar si tiene costes asociados
  const { count, error } = await supabase
    .from("hr_employee_costs")
    .select("*", { count: "exact", head: true })
    .eq("employee_id", id);

  if (error) throw error;

  if (count && count > 0) {
    return {
      canDelete: false,
      reason: `El empleado tiene ${count} registro${count > 1 ? "s" : ""} de costes asociado${count > 1 ? "s" : ""}`,
    };
  }

  return { canDelete: true };
};

/**
 * Actualiza el salario anual de un empleado
 */
export const updateEmployeeSalary = async (
  employeeId: string,
  newSalary: number
): Promise<Employee> => {
  const { data, error } = await supabase
    .from("hr_employees")
    .update({ annual_salary: newSalary })
    .eq("id", employeeId)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("No se pudo actualizar el salario");

  return data;
};

/**
 * Check employee matching for import preview
 * Used by: MatchingPreview component
 */
export const checkEmployeeMatching = async (identifiers: {
  codes: string[];
  nifs: string[];
  names: string[];
}) => {
  const [empsByCode, empsByNif, empsByName] = await Promise.all([
    // Match by employee code
    identifiers.codes.length > 0
      ? supabase.from("hr_employees")
          .select("employee_code")
          .in("employee_code", identifiers.codes)
      : Promise.resolve({ data: [], error: null }),
    
    // Match by NIF
    identifiers.nifs.length > 0
      ? supabase.from("hr_employees")
          .select("dni")
          .in("dni", identifiers.nifs)
      : Promise.resolve({ data: [], error: null }),
    
    // Match by name
    identifiers.names.length > 0
      ? supabase.from("hr_employees")
          .select("full_name")
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (empsByCode.error) throw empsByCode.error;
  if (empsByNif.error) throw empsByNif.error;
  if (empsByName.error) throw empsByName.error;

  return {
    matchedCodes: new Set(empsByCode.data?.map(e => e.employee_code) || []),
    matchedNifs: new Set(empsByNif.data?.map(e => e.dni) || []),
    matchedNames: new Set(empsByName.data?.map(e => e.full_name.toLowerCase().trim()) || []),
  };
};
