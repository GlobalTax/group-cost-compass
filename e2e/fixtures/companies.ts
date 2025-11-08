import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Seed de empresas y costes de prueba para tests E2E
 */
export async function seedCompaniesAndCosts() {
  try {
    // Limpiar datos previos de tests
    await supabase.from('hr_employee_costs').delete().ilike('period', '2025-%');
    await supabase.from('hr_employees').delete().ilike('full_name', 'Test%');

    // Obtener o crear empresas del grupo
    const { data: companies } = await supabase
      .from('companies')
      .upsert([
        { nif: 'B67261552', name: 'Navarro Legal y Tributario, SLP', status: 'active' },
        { nif: 'B09835315', name: 'Beglobal Worldwide, SL', status: 'active' },
      ], { onConflict: 'nif' })
      .select();

    if (!companies || companies.length === 0) {
      throw new Error('No se pudieron crear empresas de test');
    }

    // Crear empleados de prueba
    const { data: employees } = await supabase
      .from('hr_employees')
      .insert([
        {
          full_name: 'Test Employee 1',
          employee_code: 'TEST-001',
          nif: '12345678A',
          company_id: companies[0].id,
          hire_date: '2024-01-01',
          status: 'active',
        },
        {
          full_name: 'Test Employee 2',
          employee_code: 'TEST-002',
          nif: '87654321B',
          company_id: companies[1].id,
          hire_date: '2024-06-01',
          status: 'active',
        },
      ])
      .select();

    if (!employees || employees.length === 0) {
      throw new Error('No se pudieron crear empleados de test');
    }

    // Crear costes mensuales
    const costsToInsert = [];
    for (const employee of employees) {
      for (let month = 1; month <= 3; month++) {
        costsToInsert.push({
          employee_id: employee.id,
          period: `2025-${String(month).padStart(2, '0')}-01`,
          bruto: 3000 + (month * 100),
          coste_empresa: 3600 + (month * 120),
        });
      }
    }

    await supabase.from('hr_employee_costs').insert(costsToInsert);

    return { companies, employees };
  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  }
}

/**
 * Limpiar datos de prueba
 */
export async function cleanupTestData() {
  await supabase.from('hr_employee_costs').delete().ilike('period', '2025-%');
  await supabase.from('hr_employees').delete().ilike('full_name', 'Test%');
}
