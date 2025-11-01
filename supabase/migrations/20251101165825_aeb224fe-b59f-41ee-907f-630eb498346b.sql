-- =====================================================
-- PASO 1: LIMPIEZA TOTAL Y DEFINITIVA (CORREGIDA)
-- Grupo Navarro | Capittal
-- =====================================================

-- Eliminar todos los bonus payments de las 5 empresas
DELETE FROM bonus_payments
WHERE employee_id IN (
  SELECT e.id 
  FROM hr_employees e
  JOIN companies c ON e.company_id = c.id
  WHERE c.nif IN (
    'B58068800',  -- Navarro Empresarial
    'B67261542',  -- Navarro Empresarial (NIF alternativo)
    'B67261552',  -- Navarro Legal
    'B09835315',  -- Beglobal
    'B02721918',  -- GoLooper
    'B09652017'   -- SPV
  )
);

-- Eliminar todos los costes de las 5 empresas
DELETE FROM hr_employee_costs
WHERE employee_id IN (
  SELECT e.id 
  FROM hr_employees e
  JOIN companies c ON e.company_id = c.id
  WHERE c.nif IN (
    'B58068800',
    'B67261542',
    'B67261552',
    'B09835315',
    'B02721918',
    'B09652017'
  )
);

-- Eliminar todos los traslados de las 5 empresas
DELETE FROM hr_transfers
WHERE employee_id IN (
  SELECT e.id 
  FROM hr_employees e
  JOIN companies c ON e.company_id = c.id
  WHERE c.nif IN (
    'B58068800',
    'B67261542',
    'B67261552',
    'B09835315',
    'B02721918',
    'B09652017'
  )
);

-- Eliminar performance reviews
DELETE FROM performance_reviews
WHERE employee_id IN (
  SELECT e.id 
  FROM hr_employees e
  JOIN companies c ON e.company_id = c.id
  WHERE c.nif IN (
    'B58068800',
    'B67261542',
    'B67261552',
    'B09835315',
    'B02721918',
    'B09652017'
  )
);

-- Eliminar todos los empleados de las 5 empresas
DELETE FROM hr_employees
WHERE company_id IN (
  SELECT id 
  FROM companies 
  WHERE nif IN (
    'B58068800',
    'B67261542',
    'B67261552',
    'B09835315',
    'B02721918',
    'B09652017'
  )
);

-- Verificación: debe retornar 0
SELECT COUNT(*) as empleados_restantes
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE c.nif IN ('B58068800', 'B67261542', 'B67261552', 'B09835315', 'B02721918', 'B09652017');