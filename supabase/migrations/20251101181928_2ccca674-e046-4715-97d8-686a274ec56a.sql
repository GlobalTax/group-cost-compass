-- =====================================================
-- PASO 1: LIMPIEZA TOTAL - Grupo Navarro | Capittal
-- =====================================================

-- 1. Eliminar bonus_payments
DELETE FROM bonus_payments
WHERE employee_id IN (
  SELECT e.id 
  FROM hr_employees e
  JOIN companies c ON e.company_id = c.id
  WHERE c.nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017')
);

-- 2. Eliminar performance_reviews
DELETE FROM performance_reviews
WHERE employee_id IN (
  SELECT e.id 
  FROM hr_employees e
  JOIN companies c ON e.company_id = c.id
  WHERE c.nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017')
);

-- 3. Eliminar costes
DELETE FROM hr_employee_costs
WHERE employee_id IN (
  SELECT e.id 
  FROM hr_employees e
  JOIN companies c ON e.company_id = c.id
  WHERE c.nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017')
);

-- 4. Eliminar traslados
DELETE FROM hr_transfers
WHERE employee_id IN (
  SELECT e.id 
  FROM hr_employees e
  JOIN companies c ON e.company_id = c.id
  WHERE c.nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017')
);

-- 5. Eliminar empleados
DELETE FROM hr_employees
WHERE company_id IN (
  SELECT id 
  FROM companies 
  WHERE nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017')
);