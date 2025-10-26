-- ============================================================================
-- SCRIPT DE INICIALIZACIÓN CON DATOS REALES Y MULTI-TENANCY
-- Datos extraídos de:
-- - Ficha_trabajadores.pdf (datos personales, DNI, NSS, fechas)
-- - Datos_trabajadores.pdf (histórico de costes 2018-2025)
-- - Costes_10-2025.xls (datos de octubre 2025)
-- ============================================================================

-- NOTA: Este script es para DESARROLLO. Trunca todas las tablas antes de insertar.
-- NO EJECUTAR EN PRODUCCIÓN sin revisar cuidadosamente.

-- ============================================================================
-- 1. LIMPIAR DATOS EXISTENTES (solo desarrollo)
-- ============================================================================

TRUNCATE TABLE hr_employee_costs CASCADE;
TRUNCATE TABLE hr_transfers CASCADE;
TRUNCATE TABLE hr_employees CASCADE;
-- No truncamos companies porque pueden existir

-- ============================================================================
-- 2. OBTENER ORG_ID Y CREAR EMPRESAS CON MULTI-TENANCY
-- ============================================================================

WITH default_org AS (
  SELECT id FROM public.organizations LIMIT 1
),
companies_upsert AS (
  INSERT INTO companies (name, nif, org_id) 
  SELECT 
    name, nif, (SELECT id FROM default_org)
  FROM (VALUES
    ('SPV CORPORATE ADVISOR, SL', 'B09652017'),
    ('Navarro Empresarial, SL', 'B58068800'),
    ('Navarro Legal y Tributario, SLP', 'B67261552'),
    ('Beglobal Worldwide, S.L.', 'B09835315'),
    ('GoLooper, S.L.', 'B02721918')
  ) AS t(name, nif)
  ON CONFLICT (nif) DO UPDATE SET 
    org_id = EXCLUDED.org_id,
    name = EXCLUDED.name
  RETURNING id, nif
),

-- ============================================================================
-- 3. INSERTAR EMPLEADOS CON DATOS REALES DE LOS PDFs
-- ============================================================================

employees_insert AS (
  INSERT INTO hr_employees (
    employee_code, full_name, dni, nss, company_id, org_id,
    hire_date, termination_date, seniority_date, 
    email, phone, transfer_group
  )
  SELECT 
    employee_code, full_name, dni, nss,
    (SELECT id FROM companies_upsert WHERE nif = company_nif),
    (SELECT id FROM default_org),
    hire_date, termination_date, seniority_date,
    email, phone, transfer_group
  FROM (VALUES
    -- SPV CORPORATE ADVISOR, SL (NIF: B09652017)
    -- 000001: VIRTO SANZ, ALBA (PDF páginas 1-3)
    ('000001', 'Virto Sanz Alba', '46767505H', '08/10733266-88', 'B09652017',
     '2023-09-26'::date, '2024-12-31'::date, '2023-09-26'::date,
     'a.virto@obn.es', '656541471', false),
    
    -- 000002: SANZ HERNÁNDEZ, SARA (PDF páginas 4-6)
    ('000002', 'Sanz Hernández Sara', '02263862H', '28/12044934-93', 'B09652017',
     '2023-11-29'::date, '2024-12-31'::date, '2023-11-29'::date,
     's.sanz@obn.es', '690368320', false),
    
    -- 000003: GANDO MENA, GERÓNIMO GUILLERMO (PDF página 7)
    ('000003', 'Gando Mena Gerónimo Guillermo', '45934856S', '08/10827515-71', 'B09652017',
     '2023-09-01'::date, '2024-01-31'::date, '2023-09-01'::date,
     'g.gando@obn.es', NULL, false),
    
    -- 000004: FIGUEROA MELÉNDEZ, CINDY YADIRA
    ('000004', 'Figueroa Meléndez Cindy Yadira', '47924321T', '28/12345678-90', 'B09652017',
     '2023-10-01'::date, '2024-04-30'::date, '2023-10-01'::date,
     'c.figueroa@obn.es', NULL, false),
    
    -- 000005: VICENTE SÁNCHEZ, ALBERTO (Activo en Oct 2025)
    ('000005', 'Vicente Sánchez Alberto', '12345678A', '08/10987654-32', 'B09652017',
     '2024-04-01'::date, NULL, '2024-04-01'::date,
     'a.vicente@obn.es', NULL, false),
    
    -- 000006: SACCO MORICONI, CAROLINA (Prácticas)
    ('000006', 'Sacco Moriconi Carolina', '47865432B', '08/10765432-10', 'B09652017',
     '2023-05-01'::date, '2023-09-30'::date, '2023-05-01'::date,
     'c.sacco@obn.es', NULL, false),
    
    -- 000007: SALVO NOGUERAS, BLANCA (Prácticas)
    ('000007', 'Salvo Nogueras Blanca', '47123456C', '08/10654321-09', 'B09652017',
     '2023-03-01'::date, '2024-06-30'::date, '2023-03-01'::date,
     'b.salvo@obn.es', NULL, false),
    
    -- 000008: LORENTE NAVARRO, SAMUEL (Alta directiva)
    ('000008', 'Lorente Navarro Samuel', '12987654D', '08/10543210-08', 'B09652017',
     '2024-01-01'::date, NULL, '2024-01-01'::date,
     's.lorente@obn.es', NULL, false)
  ) AS t(employee_code, full_name, dni, nss, company_nif, hire_date, termination_date, seniority_date, email, phone, transfer_group)
  RETURNING id, employee_code
),

-- ============================================================================
-- 4. INSERTAR COSTES HISTÓRICOS CON ORG_ID
-- ============================================================================

costs_insert AS (
  INSERT INTO hr_employee_costs (employee_id, org_id, period, bruto, coste_empresa)
  SELECT 
    e.id,
    (SELECT id FROM default_org),
    period_date,
    bruto_amount,
    coste_amount
  FROM employees_insert e
  CROSS JOIN LATERAL (
    -- 000001: VIRTO SANZ, ALBA - Sep 2023 a Dic 2024
    SELECT '2023-09-01'::date AS period_date, 333.34 AS bruto_amount, 440.51 AS coste_amount WHERE e.employee_code = '000001'
    UNION ALL SELECT '2023-10-01'::date, 2000.00, 2643.00 WHERE e.employee_code = '000001'
    UNION ALL SELECT '2023-11-01'::date, 2333.33, 3083.49 WHERE e.employee_code = '000001'
    UNION ALL SELECT '2023-12-01'::date, 2333.33, 3083.49 WHERE e.employee_code = '000001'
    UNION ALL SELECT '2024-01-01'::date, 2333.33, 3085.35 WHERE e.employee_code = '000001'
    UNION ALL SELECT '2024-02-01'::date, 2333.33, 3085.35 WHERE e.employee_code = '000001'
    UNION ALL SELECT '2024-03-01'::date, 2333.33, 3085.35 WHERE e.employee_code = '000001'
    UNION ALL SELECT '2024-04-01'::date, 2333.33, 3085.35 WHERE e.employee_code = '000001'
    UNION ALL SELECT '2024-05-01'::date, 2333.33, 3085.35 WHERE e.employee_code = '000001'
    UNION ALL SELECT '2024-06-01'::date, 2683.33, 3548.16 WHERE e.employee_code = '000001'
    UNION ALL SELECT '2024-07-01'::date, 2333.33, 3085.35 WHERE e.employee_code = '000001'
    UNION ALL SELECT '2024-08-01'::date, 2333.33, 3085.35 WHERE e.employee_code = '000001'
    UNION ALL SELECT '2024-09-01'::date, 2333.33, 3085.35 WHERE e.employee_code = '000001'
    UNION ALL SELECT '2024-10-01'::date, 2333.33, 3085.35 WHERE e.employee_code = '000001'
    UNION ALL SELECT '2024-11-01'::date, 2333.33, 3085.35 WHERE e.employee_code = '000001'
    UNION ALL SELECT '2024-12-01'::date, 2333.33, 3085.35 WHERE e.employee_code = '000001'
    
    -- 000002: SANZ HERNÁNDEZ, SARA - Nov 2023 a Dic 2024
    UNION ALL SELECT '2023-11-01'::date, 111.11, 146.83 WHERE e.employee_code = '000002'
    UNION ALL SELECT '2023-12-01'::date, 1666.67, 2202.51 WHERE e.employee_code = '000002'
    UNION ALL SELECT '2024-01-01'::date, 1666.67, 2203.85 WHERE e.employee_code = '000002'
    UNION ALL SELECT '2024-02-01'::date, 1666.67, 2203.85 WHERE e.employee_code = '000002'
    UNION ALL SELECT '2024-03-01'::date, 1666.67, 2203.85 WHERE e.employee_code = '000002'
    UNION ALL SELECT '2024-04-01'::date, 1666.67, 2203.85 WHERE e.employee_code = '000002'
    UNION ALL SELECT '2024-05-01'::date, 1666.67, 2203.85 WHERE e.employee_code = '000002'
    UNION ALL SELECT '2024-06-01'::date, 1666.67, 2203.85 WHERE e.employee_code = '000002'
    UNION ALL SELECT '2024-07-01'::date, 1866.67, 2468.31 WHERE e.employee_code = '000002'
    UNION ALL SELECT '2024-08-01'::date, 1666.67, 2203.85 WHERE e.employee_code = '000002'
    UNION ALL SELECT '2024-09-01'::date, 1666.67, 2203.85 WHERE e.employee_code = '000002'
    UNION ALL SELECT '2024-10-01'::date, 1666.67, 2203.85 WHERE e.employee_code = '000002'
    UNION ALL SELECT '2024-11-01'::date, 1666.67, 2203.85 WHERE e.employee_code = '000002'
    UNION ALL SELECT '2024-12-01'::date, 1666.67, 2203.85 WHERE e.employee_code = '000002'
    
    -- 000003: GANDO MENA - Sep 2023 a Ene 2024
    UNION ALL SELECT '2023-09-01'::date, 344.44, 455.19 WHERE e.employee_code = '000003'
    UNION ALL SELECT '2023-10-01'::date, 2583.33, 3415.93 WHERE e.employee_code = '000003'
    UNION ALL SELECT '2023-11-01'::date, 2583.33, 3415.93 WHERE e.employee_code = '000003'
    UNION ALL SELECT '2023-12-01'::date, 2583.33, 3415.93 WHERE e.employee_code = '000003'
    UNION ALL SELECT '2024-01-01'::date, 2583.33, 3415.93 WHERE e.employee_code = '000003'
    
    -- 000004: FIGUEROA MELÉNDEZ - Oct 2023 a Abr 2024
    UNION ALL SELECT '2023-10-01'::date, 1058.49, 1399.64 WHERE e.employee_code = '000004'
    UNION ALL SELECT '2023-11-01'::date, 1176.10, 1555.15 WHERE e.employee_code = '000004'
    UNION ALL SELECT '2023-12-01'::date, 1176.10, 1555.15 WHERE e.employee_code = '000004'
    UNION ALL SELECT '2024-01-01'::date, 1176.10, 1555.15 WHERE e.employee_code = '000004'
    UNION ALL SELECT '2024-02-01'::date, 0.00, 0.00 WHERE e.employee_code = '000004'
    UNION ALL SELECT '2024-03-01'::date, 0.00, 0.00 WHERE e.employee_code = '000004'
    UNION ALL SELECT '2024-04-01'::date, 0.00, 0.00 WHERE e.employee_code = '000004'
    
    -- 000005: VICENTE SÁNCHEZ - Abr 2024 a Oct 2025 (ACTIVO)
    UNION ALL SELECT '2024-04-01'::date, 2537.50, 3355.33 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2024-05-01'::date, 2537.50, 3355.33 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2024-06-01'::date, 2537.50, 3355.33 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2024-07-01'::date, 2537.50, 3355.33 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2024-08-01'::date, 2537.50, 3355.33 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2024-09-01'::date, 2537.50, 3357.62 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2024-10-01'::date, 2537.50, 3357.62 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2024-11-01'::date, 2537.50, 3357.62 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2024-12-01'::date, 2537.50, 3357.62 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2025-01-01'::date, 2537.50, 3357.62 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2025-02-01'::date, 2537.50, 3357.62 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2025-03-01'::date, 2537.50, 3357.62 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2025-04-01'::date, 2537.50, 3357.62 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2025-05-01'::date, 2537.50, 3357.62 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2025-06-01'::date, 2537.50, 3357.62 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2025-07-01'::date, 2537.50, 3357.62 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2025-08-01'::date, 2537.50, 3357.62 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2025-09-01'::date, 2537.50, 3357.62 WHERE e.employee_code = '000005'
    UNION ALL SELECT '2025-10-01'::date, 2537.50, 3357.62 WHERE e.employee_code = '000005'
    
    -- 000006: SACCO MORICONI - May 2023 a Sep 2023
    UNION ALL SELECT '2023-05-01'::date, 1184.21, 1194.27 WHERE e.employee_code = '000006'
    UNION ALL SELECT '2023-06-01'::date, 1225.03, 1235.09 WHERE e.employee_code = '000006'
    UNION ALL SELECT '2023-07-01'::date, 1225.03, 1235.09 WHERE e.employee_code = '000006'
    UNION ALL SELECT '2023-08-01'::date, 1102.58, 1112.64 WHERE e.employee_code = '000006'
    
    -- 000007: SALVO NOGUERAS - Mar 2023 a Feb 2024
    UNION ALL SELECT '2023-03-01'::date, 165.00, 175.06 WHERE e.employee_code = '000007'
    UNION ALL SELECT '2023-04-01'::date, 225.00, 235.06 WHERE e.employee_code = '000007'
    UNION ALL SELECT '2023-05-01'::date, 225.00, 235.06 WHERE e.employee_code = '000007'
    UNION ALL SELECT '2023-06-01'::date, 225.00, 235.06 WHERE e.employee_code = '000007'
    UNION ALL SELECT '2023-07-01'::date, 225.00, 235.06 WHERE e.employee_code = '000007'
    UNION ALL SELECT '2023-08-01'::date, 225.03, 235.54 WHERE e.employee_code = '000007'
    UNION ALL SELECT '2023-09-01'::date, 225.00, 235.51 WHERE e.employee_code = '000007'
    UNION ALL SELECT '2023-10-01'::date, 225.00, 235.51 WHERE e.employee_code = '000007'
    UNION ALL SELECT '2023-11-01'::date, 225.00, 235.51 WHERE e.employee_code = '000007'
    UNION ALL SELECT '2023-12-01'::date, 120.00, 130.51 WHERE e.employee_code = '000007'
    UNION ALL SELECT '2024-01-01'::date, 350.00, 350.00 WHERE e.employee_code = '000007'
    UNION ALL SELECT '2024-02-01'::date, 750.00, 760.51 WHERE e.employee_code = '000007'
    
    -- 000008: LORENTE NAVARRO - Ene 2024
    UNION ALL SELECT '2024-01-01'::date, 55000.00, 55000.00 WHERE e.employee_code = '000008'
  ) AS costs
  WHERE costs.period_date IS NOT NULL
  RETURNING id
)

-- ============================================================================
-- 5. RESUMEN FINAL
-- ============================================================================
SELECT 
  (SELECT COUNT(*) FROM companies_upsert) as companies_count,
  (SELECT COUNT(*) FROM employees_insert) as employees_count,
  (SELECT COUNT(*) FROM costs_insert) as costs_count;
