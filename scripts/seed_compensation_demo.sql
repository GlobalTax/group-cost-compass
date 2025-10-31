-- =====================================================
-- Seed Data Demo: Sistema de Compensación M&A
-- =====================================================
-- Este script inserta datos de ejemplo para demostrar
-- el sistema de compensación con empleados, deals,
-- participantes, evaluaciones y bonus payments.
-- =====================================================

-- Limpiar datos demo previos (opcional, comentar si no quieres limpiar)
-- DELETE FROM public.deal_participants WHERE deal_id IN (SELECT id FROM public.deals WHERE client_name LIKE 'Demo%');
-- DELETE FROM public.bonus_payments WHERE employee_id IN (SELECT id FROM public.hr_employees WHERE full_name LIKE 'Demo%');
-- DELETE FROM public.performance_reviews WHERE employee_id IN (SELECT id FROM public.hr_employees WHERE full_name LIKE 'Demo%');
-- DELETE FROM public.deals WHERE client_name LIKE 'Demo%';
-- DELETE FROM public.hr_employees WHERE full_name LIKE 'Demo%';

-- =====================================================
-- 1. BANDAS SALARIALES (si no existen)
-- =====================================================
INSERT INTO public.compensation_bands (level, min_salary, target_salary, max_salary, target_bonus_pct, description, created_at)
VALUES
  ('IC1', 25000, 30000, 35000, 5, 'Individual Contributor - Entry Level', NOW()),
  ('IC2', 32000, 38000, 45000, 8, 'Individual Contributor - Mid Level', NOW()),
  ('IC3', 42000, 50000, 60000, 12, 'Individual Contributor - Senior', NOW()),
  ('M1', 55000, 65000, 75000, 15, 'Manager - Entry Level', NOW()),
  ('M2', 70000, 85000, 100000, 20, 'Manager - Senior', NOW())
ON CONFLICT (level) DO NOTHING;

-- =====================================================
-- 2. EMPLEADOS DEMO (5 perfiles variados)
-- =====================================================
-- NOTA: Ajustar company_id según tu catálogo de empresas
-- Asumiendo que existe una empresa con tax_id 'B67261552' (Navarro Legal)

INSERT INTO public.hr_employees (
  id,
  employee_id,
  nif,
  full_name,
  first_name,
  last_name,
  email,
  company_id,
  department,
  position,
  compensation_level,
  hire_date,
  status,
  created_at
)
VALUES
  -- IC1: Junior Analyst
  (gen_random_uuid(), 'EMP-DEMO-001', '12345678A', 'Demo Ana García', 'Ana', 'García', 'ana.garcia@demo.com', 
   (SELECT id FROM public.companies WHERE tax_id = 'B67261552' LIMIT 1), 'M&A', 'Junior Analyst', 'IC1', '2024-01-15', 'active', NOW()),
  
  -- IC2: Analyst
  (gen_random_uuid(), 'EMP-DEMO-002', '23456789B', 'Demo Carlos Ruiz', 'Carlos', 'Ruiz', 'carlos.ruiz@demo.com',
   (SELECT id FROM public.companies WHERE tax_id = 'B67261552' LIMIT 1), 'M&A', 'Analyst', 'IC2', '2023-06-01', 'active', NOW()),
  
  -- IC3: Senior Analyst
  (gen_random_uuid(), 'EMP-DEMO-003', '34567890C', 'Demo Laura Martín', 'Laura', 'Martín', 'laura.martin@demo.com',
   (SELECT id FROM public.companies WHERE tax_id = 'B67261552' LIMIT 1), 'M&A', 'Senior Analyst', 'IC3', '2022-03-01', 'active', NOW()),
  
  -- M1: Associate
  (gen_random_uuid(), 'EMP-DEMO-004', '45678901D', 'Demo Miguel Torres', 'Miguel', 'Torres', 'miguel.torres@demo.com',
   (SELECT id FROM public.companies WHERE tax_id = 'B67261552' LIMIT 1), 'M&A', 'Associate', 'M1', '2021-09-01', 'active', NOW()),
  
  -- M2: Partner
  (gen_random_uuid(), 'EMP-DEMO-005', '56789012E', 'Demo Patricia Vega', 'Patricia', 'Vega', 'patricia.vega@demo.com',
   (SELECT id FROM public.companies WHERE tax_id = 'B67261552' LIMIT 1), 'M&A', 'Partner', 'M2', '2020-01-01', 'active', NOW())
ON CONFLICT (employee_id) DO NOTHING;

-- =====================================================
-- 3. COSTES HISTÓRICOS (últimos 12 meses para cálculos)
-- =====================================================
-- Insertar salarios mensuales para cada empleado (ejemplo simplificado)
DO $$
DECLARE
  emp RECORD;
  month_date DATE;
  salaries NUMERIC[] := ARRAY[30000, 38000, 50000, 65000, 85000]; -- salarios target por nivel
  idx INT := 1;
BEGIN
  FOR emp IN 
    SELECT id, employee_id FROM public.hr_employees WHERE employee_id LIKE 'EMP-DEMO-%' ORDER BY employee_id
  LOOP
    -- Insertar 12 meses de costes (desde hace 12 meses hasta ahora)
    FOR i IN 0..11 LOOP
      month_date := DATE_TRUNC('month', NOW() - INTERVAL '1 month' * (11 - i));
      
      INSERT INTO public.hr_employee_costs (
        employee_id,
        period_month,
        bruto,
        coste_empresa,
        created_at
      )
      VALUES (
        emp.id,
        month_date,
        salaries[idx],
        salaries[idx] * 1.30, -- aprox 30% SS
        NOW()
      )
      ON CONFLICT (employee_id, period_month) DO NOTHING;
    END LOOP;
    
    idx := idx + 1;
    IF idx > 5 THEN idx := 5; END IF; -- mantener en el último salario
  END LOOP;
END $$;

-- =====================================================
-- 4. DEALS (3 operaciones: 1 cerrada, 1 activa, 1 pipeline)
-- =====================================================
INSERT INTO public.deals (
  id,
  deal_name,
  client_name,
  deal_type,
  status,
  total_fees,
  success_fee_pool,
  fiscal_year,
  lead_partner_id,
  start_date,
  close_date,
  description,
  created_at
)
VALUES
  -- Deal 1: CERRADA (H1 2024)
  (
    gen_random_uuid(),
    'Adquisición Demo TechCorp',
    'Demo TechCorp SL',
    'buy_side',
    'closed',
    50000,
    12500, -- 25% del fee total
    2024,
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-005' LIMIT 1),
    '2024-01-10',
    '2024-06-30',
    'Asesoramiento en compra de startup tecnológica',
    NOW()
  ),
  
  -- Deal 2: ACTIVA (en negociación)
  (
    gen_random_uuid(),
    'Venta Demo IndustrialCo',
    'Demo IndustrialCo SA',
    'sell_side',
    'active',
    80000,
    20000, -- 25% del fee total
    2024,
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-005' LIMIT 1),
    '2024-07-01',
    NULL,
    'Venta de empresa industrial a fondo de inversión',
    NOW()
  ),
  
  -- Deal 3: PIPELINE (identificada, no iniciada)
  (
    gen_random_uuid(),
    'Fusión Demo RetailGroup',
    'Demo RetailGroup SLU',
    'merger',
    'pipeline',
    120000,
    30000, -- 25% del fee total
    2024,
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-005' LIMIT 1),
    NULL,
    NULL,
    'Fusión de dos cadenas de retail para crear líder regional',
    NOW()
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. PARTICIPANTES EN DEALS
-- =====================================================
-- Deal 1 (CERRADA): Partner 40%, Associate 30%, Senior 20%, Analyst 10%
INSERT INTO public.deal_participants (deal_id, employee_id, role_in_deal, participation_pct, bonus_amount, created_at)
VALUES
  -- Partner lead
  (
    (SELECT id FROM public.deals WHERE client_name = 'Demo TechCorp SL' LIMIT 1),
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-005' LIMIT 1),
    'Lead Partner',
    40,
    5000, -- 40% de 12.5k = 5k
    NOW()
  ),
  -- Associate
  (
    (SELECT id FROM public.deals WHERE client_name = 'Demo TechCorp SL' LIMIT 1),
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-004' LIMIT 1),
    'Deal Manager',
    30,
    3750, -- 30% de 12.5k = 3.75k
    NOW()
  ),
  -- Senior Analyst
  (
    (SELECT id FROM public.deals WHERE client_name = 'Demo TechCorp SL' LIMIT 1),
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-003' LIMIT 1),
    'Senior Analyst',
    20,
    2500, -- 20% de 12.5k = 2.5k
    NOW()
  ),
  -- Analyst
  (
    (SELECT id FROM public.deals WHERE client_name = 'Demo TechCorp SL' LIMIT 1),
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-002' LIMIT 1),
    'Junior Analyst',
    10,
    1250, -- 10% de 12.5k = 1.25k
    NOW()
  )
ON CONFLICT DO NOTHING;

-- Deal 2 (ACTIVA): Partner 50%, Associate 25%, Senior 25%
INSERT INTO public.deal_participants (deal_id, employee_id, role_in_deal, participation_pct, bonus_amount, created_at)
VALUES
  (
    (SELECT id FROM public.deals WHERE client_name = 'Demo IndustrialCo SA' LIMIT 1),
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-005' LIMIT 1),
    'Lead Partner',
    50,
    10000, -- 50% de 20k = 10k
    NOW()
  ),
  (
    (SELECT id FROM public.deals WHERE client_name = 'Demo IndustrialCo SA' LIMIT 1),
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-004' LIMIT 1),
    'Deal Manager',
    25,
    5000, -- 25% de 20k = 5k
    NOW()
  ),
  (
    (SELECT id FROM public.deals WHERE client_name = 'Demo IndustrialCo SA' LIMIT 1),
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-003' LIMIT 1),
    'Senior Analyst',
    25,
    5000, -- 25% de 20k = 5k
    NOW()
  )
ON CONFLICT DO NOTHING;

-- Deal 3 (PIPELINE): Partner 60%, Associate 40% (pendiente de asignar más)
INSERT INTO public.deal_participants (deal_id, employee_id, role_in_deal, participation_pct, bonus_amount, created_at)
VALUES
  (
    (SELECT id FROM public.deals WHERE client_name = 'Demo RetailGroup SLU' LIMIT 1),
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-005' LIMIT 1),
    'Lead Partner',
    60,
    18000, -- 60% de 30k = 18k
    NOW()
  ),
  (
    (SELECT id FROM public.deals WHERE client_name = 'Demo RetailGroup SLU' LIMIT 1),
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-004' LIMIT 1),
    'Deal Manager',
    40,
    12000, -- 40% de 30k = 12k
    NOW()
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. PERFORMANCE REVIEWS (H1 y H2 2024)
-- =====================================================
INSERT INTO public.performance_reviews (
  employee_id,
  review_period,
  review_date,
  reviewer_id,
  performance_score,
  bonus_multiplier,
  strengths,
  areas_improvement,
  created_at
)
VALUES
  -- Ana García (IC1): H1 2024 - Performance básico
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-001' LIMIT 1),
    '2024-H1',
    '2024-07-15',
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-005' LIMIT 1),
    7.0,
    1.0,
    'Aprendizaje rápido, buena actitud',
    'Mejorar análisis financiero, mayor autonomía',
    NOW()
  ),
  
  -- Carlos Ruiz (IC2): H1 2024 - Performance sólido
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-002' LIMIT 1),
    '2024-H1',
    '2024-07-15',
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-005' LIMIT 1),
    8.5,
    1.2,
    'Excelente capacidad analítica, proactivo',
    'Liderar más iniciativas',
    NOW()
  ),
  
  -- Laura Martín (IC3): H1 2024 - Performance excepcional
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-003' LIMIT 1),
    '2024-H1',
    '2024-07-15',
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-005' LIMIT 1),
    9.0,
    1.4,
    'Liderazgo técnico sobresaliente, mentor de juniors',
    'Desarrollo de clientes propios',
    NOW()
  ),
  
  -- Miguel Torres (M1): H1 2024 - Performance fuerte
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-004' LIMIT 1),
    '2024-H1',
    '2024-07-15',
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-005' LIMIT 1),
    8.8,
    1.3,
    'Gestión de deals excelente, desarrollo de equipo',
    'Ampliar red de clientes',
    NOW()
  ),
  
  -- Patricia Vega (M2): H1 2024 - Performance top (autoevaluación supervisada)
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-005' LIMIT 1),
    '2024-H1',
    '2024-07-15',
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-005' LIMIT 1),
    9.5,
    1.5,
    'Cierre de deals estratégicos, desarrollo de equipo de alto rendimiento',
    'Delegación táctica en juniors',
    NOW()
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. BONUS PAYMENTS HISTÓRICOS (H1 2024 - Deal cerrada)
-- =====================================================
-- Bonus de success fee del Deal 1 (TechCorp cerrada en Jun 2024)
INSERT INTO public.bonus_payments (
  employee_id,
  payment_date,
  amount,
  bonus_type,
  fiscal_year,
  period,
  deal_id,
  status,
  notes,
  created_at
)
VALUES
  -- Ana García: Sin participación directa, pero recibió bonus de performance
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-001' LIMIT 1),
    '2024-07-31',
    1500, -- 5% target sobre 30k = 1.5k
    'performance',
    2024,
    '2024-H1',
    NULL,
    'paid',
    'Bonus H1 2024 - Performance 7.0 (multiplier 1.0)',
    NOW()
  ),
  
  -- Carlos Ruiz: Success fee (1.25k) + Performance (3.04k x 1.2 = 3.65k)
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-002' LIMIT 1),
    '2024-07-31',
    1250,
    'success_fee',
    2024,
    '2024-H1',
    (SELECT id FROM public.deals WHERE client_name = 'Demo TechCorp SL' LIMIT 1),
    'paid',
    'Success fee Deal TechCorp - 10% participación',
    NOW()
  ),
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-002' LIMIT 1),
    '2024-07-31',
    3650, -- 8% target sobre 38k x 1.2 = 3.65k
    'performance',
    2024,
    '2024-H1',
    NULL,
    'paid',
    'Bonus H1 2024 - Performance 8.5 (multiplier 1.2)',
    NOW()
  ),
  
  -- Laura Martín: Success fee (2.5k) + Performance (6k x 1.4 = 8.4k)
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-003' LIMIT 1),
    '2024-07-31',
    2500,
    'success_fee',
    2024,
    '2024-H1',
    (SELECT id FROM public.deals WHERE client_name = 'Demo TechCorp SL' LIMIT 1),
    'paid',
    'Success fee Deal TechCorp - 20% participación',
    NOW()
  ),
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-003' LIMIT 1),
    '2024-07-31',
    8400, -- 12% target sobre 50k x 1.4 = 8.4k
    'performance',
    2024,
    '2024-H1',
    NULL,
    'paid',
    'Bonus H1 2024 - Performance 9.0 (multiplier 1.4)',
    NOW()
  ),
  
  -- Miguel Torres: Success fee (3.75k) + Performance (9.75k x 1.3 = 12.68k)
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-004' LIMIT 1),
    '2024-07-31',
    3750,
    'success_fee',
    2024,
    '2024-H1',
    (SELECT id FROM public.deals WHERE client_name = 'Demo TechCorp SL' LIMIT 1),
    'paid',
    'Success fee Deal TechCorp - 30% participación',
    NOW()
  ),
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-004' LIMIT 1),
    '2024-07-31',
    12680, -- 15% target sobre 65k x 1.3 = 12.68k
    'performance',
    2024,
    '2024-H1',
    NULL,
    'paid',
    'Bonus H1 2024 - Performance 8.8 (multiplier 1.3)',
    NOW()
  ),
  
  -- Patricia Vega: Success fee (5k) + Performance (17k x 1.5 = 25.5k)
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-005' LIMIT 1),
    '2024-07-31',
    5000,
    'success_fee',
    2024,
    '2024-H1',
    (SELECT id FROM public.deals WHERE client_name = 'Demo TechCorp SL' LIMIT 1),
    'paid',
    'Success fee Deal TechCorp - 40% participación (lead)',
    NOW()
  ),
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-005' LIMIT 1),
    '2024-07-31',
    25500, -- 20% target sobre 85k x 1.5 = 25.5k
    'performance',
    2024,
    '2024-H1',
    NULL,
    'paid',
    'Bonus H1 2024 - Performance 9.5 (multiplier 1.5)',
    NOW()
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. BONUS PROYECTADOS (H2 2024 - Deals activas)
-- =====================================================
-- Proyecciones para Deal 2 (IndustrialCo - status projected)
INSERT INTO public.bonus_payments (
  employee_id,
  payment_date,
  amount,
  bonus_type,
  fiscal_year,
  period,
  deal_id,
  status,
  notes,
  created_at
)
VALUES
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-005' LIMIT 1),
    '2024-12-31',
    10000,
    'success_fee',
    2024,
    '2024-H2',
    (SELECT id FROM public.deals WHERE client_name = 'Demo IndustrialCo SA' LIMIT 1),
    'projected',
    'Proyección success fee Deal IndustrialCo - 50% participación',
    NOW()
  ),
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-004' LIMIT 1),
    '2024-12-31',
    5000,
    'success_fee',
    2024,
    '2024-H2',
    (SELECT id FROM public.deals WHERE client_name = 'Demo IndustrialCo SA' LIMIT 1),
    'projected',
    'Proyección success fee Deal IndustrialCo - 25% participación',
    NOW()
  ),
  (
    (SELECT id FROM public.hr_employees WHERE employee_id = 'EMP-DEMO-003' LIMIT 1),
    '2024-12-31',
    5000,
    'success_fee',
    2024,
    '2024-H2',
    (SELECT id FROM public.deals WHERE client_name = 'Demo IndustrialCo SA' LIMIT 1),
    'projected',
    'Proyección success fee Deal IndustrialCo - 25% participación',
    NOW()
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- RESUMEN DE DATOS SEED
-- =====================================================
-- 5 empleados (IC1, IC2, IC3, M1, M2)
-- 12 meses de costes históricos para cada empleado
-- 3 deals: 1 cerrada (€50k), 1 activa (€80k), 1 pipeline (€120k)
-- 9 participantes asignados a los 3 deals
-- 5 performance reviews (H1 2024)
-- 13 bonus payments: 10 pagados (H1 2024) + 3 proyectados (H2 2024)
-- =====================================================

SELECT 'Seed data demo insertado correctamente' AS status;
