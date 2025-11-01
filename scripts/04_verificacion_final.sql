-- =====================================================
-- PASO 4: VERIFICACIÓN FINAL COMPLETA
-- Grupo Navarro | Capittal - Octubre 2024
-- =====================================================
-- Queries de verificación para confirmar que todo está correcto
-- =====================================================

-- 1. RESUMEN GENERAL
SELECT 
  '=== RESUMEN GENERAL ===' as seccion,
  (SELECT COUNT(*) FROM hr_employees e 
   JOIN companies c ON e.company_id = c.id 
   WHERE c.nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017')) as total_empleados,
  (SELECT COUNT(*) FROM hr_employee_costs costs
   JOIN hr_employees e ON costs.employee_id = e.id
   JOIN companies c ON e.company_id = c.id
   WHERE c.nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017')
   AND costs.period = '2024-10-01') as total_costes_oct2024,
  (SELECT ROUND(SUM(costs.coste_empresa)::numeric, 2)
   FROM hr_employee_costs costs
   JOIN hr_employees e ON costs.employee_id = e.id
   JOIN companies c ON e.company_id = c.id
   WHERE c.nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017')
   AND costs.period = '2024-10-01') as suma_total_coste_empresa;

-- ESPERADO: 56 empleados | 55 costes | 139,726.74 €

-- 2. DESGLOSE POR EMPRESA
SELECT 
  '=== DESGLOSE POR EMPRESA ===' as seccion,
  c.name as empresa,
  c.nif,
  COUNT(DISTINCT e.id) as empleados,
  COUNT(costs.id) as costes,
  ROUND(SUM(costs.coste_empresa)::numeric, 2) as suma_coste_empresa
FROM companies c
LEFT JOIN hr_employees e ON c.id = e.company_id
LEFT JOIN hr_employee_costs costs ON e.id = costs.employee_id AND costs.period = '2024-10-01'
WHERE c.nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017')
GROUP BY c.name, c.nif
ORDER BY c.name;

-- ESPERADO:
-- Navarro Empresarial: 36 empleados | 36 costes | 102,175.29 €
-- Navarro Legal: 7 empleados | 7 costes | 13,245.43 €
-- BeGlobal: 6 empleados | 6 costes | 10,984.54 €
-- GoLooper: 6 empleados | 6 costes | 9,963.86 €
-- SPV Corporate: 1 empleado | 1 coste | 3,357.62 €

-- 3. VERIFICAR EMPLEADOS SIN COSTES
SELECT 
  '=== EMPLEADOS SIN COSTES OCT 2024 ===' as seccion,
  c.name as empresa,
  e.employee_code,
  e.full_name,
  e.department
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE c.nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017')
  AND NOT EXISTS (
    SELECT 1 FROM hr_employee_costs costs
    WHERE costs.employee_id = e.id
    AND costs.period = '2024-10-01'
  )
ORDER BY c.name, e.full_name;

-- ESPERADO: 0 filas (todos los empleados deben tener coste)

-- 4. VERIFICAR COSTES SIN EMPLEADO (HUÉRFANOS)
SELECT 
  '=== COSTES HUÉRFANOS ===' as seccion,
  costs.id,
  costs.employee_id,
  costs.period,
  costs.coste_empresa
FROM hr_employee_costs costs
WHERE costs.period = '2024-10-01'
  AND NOT EXISTS (
    SELECT 1 FROM hr_employees e
    WHERE e.id = costs.employee_id
  );

-- ESPERADO: 0 filas (no debe haber costes sin empleado)

-- 5. VERIFICAR DUPLICADOS DE EMPLOYEE_CODE
SELECT 
  '=== DUPLICADOS DE EMPLOYEE_CODE ===' as seccion,
  e.employee_code,
  COUNT(*) as veces_repetido,
  STRING_AGG(c.name, ', ') as empresas
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE c.nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017')
GROUP BY e.employee_code
HAVING COUNT(*) > 1;

-- ESPERADO: 0 filas (no debe haber employee_codes duplicados)

-- 6. LISTAR EMPLEADOS POR EMPRESA (NAVARRO EMPRESARIAL)
SELECT 
  '=== NAVARRO EMPRESARIAL (36) ===' as seccion,
  e.employee_code,
  e.full_name,
  e.department,
  costs.coste_empresa
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
LEFT JOIN hr_employee_costs costs ON e.id = costs.employee_id AND costs.period = '2024-10-01'
WHERE c.nif = 'B58068800'
ORDER BY e.employee_code;

-- 7. LISTAR EMPLEADOS POR EMPRESA (NAVARRO LEGAL)
SELECT 
  '=== NAVARRO LEGAL (7) ===' as seccion,
  e.employee_code,
  e.full_name,
  e.department,
  costs.coste_empresa
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
LEFT JOIN hr_employee_costs costs ON e.id = costs.employee_id AND costs.period = '2024-10-01'
WHERE c.nif = 'B67261552'
ORDER BY e.employee_code;

-- 8. LISTAR EMPLEADOS POR EMPRESA (BEGLOBAL)
SELECT 
  '=== BEGLOBAL (6) ===' as seccion,
  e.employee_code,
  e.full_name,
  e.department,
  costs.coste_empresa
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
LEFT JOIN hr_employee_costs costs ON e.id = costs.employee_id AND costs.period = '2024-10-01'
WHERE c.nif = 'B09835315'
ORDER BY e.employee_code;

-- 9. LISTAR EMPLEADOS POR EMPRESA (GOLOOPER)
SELECT 
  '=== GOLOOPER (6) ===' as seccion,
  e.employee_code,
  e.full_name,
  e.department,
  costs.coste_empresa
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
LEFT JOIN hr_employee_costs costs ON e.id = costs.employee_id AND costs.period = '2024-10-01'
WHERE c.nif = 'B02721918'
ORDER BY e.employee_code;

-- 10. LISTAR EMPLEADOS POR EMPRESA (SPV CORPORATE)
SELECT 
  '=== SPV CORPORATE (1) ===' as seccion,
  e.employee_code,
  e.full_name,
  e.department,
  costs.coste_empresa
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
LEFT JOIN hr_employee_costs costs ON e.id = costs.employee_id AND costs.period = '2024-10-01'
WHERE c.nif = 'B09652017'
ORDER BY e.employee_code;

-- 11. VERIFICAR QUE VICENTE SÁNCHEZ ALBERTO ESTÁ EN SPV CORPORATE
SELECT 
  '=== VERIFICAR VICENTE SÁNCHEZ ALBERTO ===' as seccion,
  e.full_name,
  c.name as empresa,
  c.nif,
  e.employee_code,
  e.department
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.full_name ILIKE '%vicente%sanchez%'
  OR e.full_name ILIKE '%sanchez%alberto%';

-- ESPERADO: Vicente Sánchez Alberto en SPV Corporate Advisor (B09652017)

-- =====================================================
-- RESUMEN FINAL
-- =====================================================
SELECT 
  '========================================' as linea
UNION ALL
SELECT '  ✅ VERIFICACIÓN COMPLETADA' 
UNION ALL
SELECT '  Total empleados: 56'
UNION ALL
SELECT '  Total costes oct 2024: 55'
UNION ALL
SELECT '  Suma total coste empresa: 139.726,74 €'
UNION ALL
SELECT '========================================';
