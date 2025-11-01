
-- =====================================================
-- SCRIPT DE LIMPIEZA TOTAL: Empleados y Costes
-- Grupo Navarro | Capittal
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
