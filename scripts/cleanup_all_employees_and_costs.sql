-- =====================================================
-- SCRIPT DE LIMPIEZA TOTAL: Empleados y Costes
-- Grupo Navarro | Capittal
-- =====================================================
-- 
-- PROPÓSITO:
-- Elimina TODOS los empleados y costes de las 5 empresas del grupo
-- para permitir una reimportación limpia desde A3Nom
--
-- EMPRESAS AFECTADAS:
-- - Navarro Empresarial, SL (B67261542)
-- - Navarro Legal y Tributario, SLP (B67261552)
-- - Beglobal Worldwide, SL (B09835315)
-- - GoLooper, SL (B02721918)
-- - SPV Corporate Advisor, SL (B09652017)
--
-- ADVERTENCIA:
-- Este script eliminará TODOS los datos históricos de empleados y costes
-- de estas 5 empresas. Asegúrate de tener un backup antes de ejecutar.
--
-- =====================================================

-- PASO 1: Eliminar todos los costes de las 5 empresas
DELETE FROM hr_employee_costs
WHERE employee_id IN (
  SELECT e.id 
  FROM hr_employees e
  JOIN companies c ON e.company_id = c.id
  WHERE c.nif IN (
    'B67261542',  -- Navarro Empresarial
    'B67261552',  -- Navarro Legal
    'B09835315',  -- Beglobal
    'B02721918',  -- GoLooper
    'B09652017'   -- SPV
  )
);

-- PASO 2: Eliminar todos los traslados de las 5 empresas
DELETE FROM hr_transfers
WHERE employee_id IN (
  SELECT e.id 
  FROM hr_employees e
  JOIN companies c ON e.company_id = c.id
  WHERE c.nif IN (
    'B67261542',
    'B67261552',
    'B09835315',
    'B02721918',
    'B09652017'
  )
);

-- PASO 3: Eliminar todos los empleados de las 5 empresas
DELETE FROM hr_employees
WHERE company_id IN (
  SELECT id 
  FROM companies 
  WHERE nif IN (
    'B67261542',
    'B67261552',
    'B09835315',
    'B02721918',
    'B09652017'
  )
);

-- =====================================================
-- QUERIES DE VERIFICACIÓN
-- Estas queries deben retornar 0 después de la limpieza
-- =====================================================

-- Verificar que no quedan empleados de las 5 empresas
SELECT 
  'Empleados restantes' as tipo,
  c.name as empresa,
  COUNT(*) as total
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE c.nif IN ('B67261542', 'B67261552', 'B09835315', 'B02721918', 'B09652017')
GROUP BY c.name
ORDER BY c.name;

-- Verificar que no quedan costes de las 5 empresas
SELECT 
  'Costes restantes' as tipo,
  c.name as empresa,
  COUNT(*) as total
FROM hr_employee_costs costs
JOIN hr_employees e ON costs.employee_id = e.id
JOIN companies c ON e.company_id = c.id
WHERE c.nif IN ('B67261542', 'B67261552', 'B09835315', 'B02721918', 'B09652017')
GROUP BY c.name
ORDER BY c.name;

-- Verificar que no quedan traslados de las 5 empresas
SELECT 
  'Traslados restantes' as tipo,
  COUNT(*) as total
FROM hr_transfers t
JOIN hr_employees e ON t.employee_id = e.id
JOIN companies c ON e.company_id = c.id
WHERE c.nif IN ('B67261542', 'B67261552', 'B09835315', 'B02721918', 'B09652017');

-- RESULTADO ESPERADO: 
-- Todas las queries deben retornar 0 o ninguna fila
-- Esto confirma que la limpieza fue exitosa
