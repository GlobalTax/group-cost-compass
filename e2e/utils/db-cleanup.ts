import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Limpiar todos los datos de prueba E2E
 * Ejecutar después de cada suite de tests
 */
export async function cleanupAllTestData() {
  try {
    // Eliminar costes de períodos de test
    await supabase.from('hr_employee_costs').delete().gte('period', '2025-01-01');

    // Eliminar empleados de test
    await supabase.from('hr_employees').delete().ilike('full_name', 'Test%');
    await supabase.from('hr_employees').delete().ilike('employee_code', 'E2E-%');
    await supabase.from('hr_employees').delete().ilike('employee_code', 'TEST-%');

    console.log('✅ Test data cleanup completed');
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
  }
}

/**
 * Resetear base de datos a estado inicial
 * Solo para entornos de desarrollo
 */
export async function resetDatabase() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Cannot reset database in production');
  }

  await cleanupAllTestData();
}
