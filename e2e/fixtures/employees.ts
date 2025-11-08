import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Crear empleado de prueba para tests E2E
 */
export async function createTestEmployee(companyId: string, overrides = {}) {
  const defaultData = {
    full_name: 'Test Employee E2E',
    employee_code: `E2E-${Date.now()}`,
    nif: generateRandomNIF(),
    company_id: companyId,
    hire_date: new Date().toISOString().split('T')[0],
    status: 'active',
  };

  const { data, error } = await supabase
    .from('hr_employees')
    .insert({ ...defaultData, ...overrides })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creando empleado de test: ${error.message}`);
  }

  return data;
}

/**
 * Generar NIF aleatorio válido
 */
function generateRandomNIF(): string {
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  const number = Math.floor(Math.random() * 100000000);
  const letter = letters[number % 23];
  return `${String(number).padStart(8, '0')}${letter}`;
}

/**
 * Eliminar empleados de prueba
 */
export async function deleteTestEmployee(employeeId: string) {
  await supabase.from('hr_employee_costs').delete().eq('employee_id', employeeId);
  await supabase.from('hr_employees').delete().eq('id', employeeId);
}
