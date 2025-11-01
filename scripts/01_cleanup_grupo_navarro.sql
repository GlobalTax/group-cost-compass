-- =====================================================
-- PASO 1: LIMPIEZA TOTAL - Grupo Navarro | Capittal
-- =====================================================
-- Elimina TODOS los empleados y datos relacionados de las 5 empresas
-- para permitir una recarga limpia con asignaciones correctas
--
-- EMPRESAS AFECTADAS:
-- - Navarro Empresarial, SL (B58068800)
-- - Navarro Legal y Tributario, SLP (B67261552)
-- - Beglobal Worldwide, SL (B09835315)
-- - GoLooper, SL (B02721918)
-- - SPV Corporate Advisor, SL (B09652017)
--
-- ADVERTENCIA: Este script eliminará TODOS los datos
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

-- =====================================================
-- VERIFICACIÓN POST-LIMPIEZA
-- =====================================================

SELECT 
  'LIMPIEZA COMPLETADA' as status,
  (SELECT COUNT(*) FROM hr_employees e 
   JOIN companies c ON e.company_id = c.id 
   WHERE c.nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017')) as empleados_restantes,
  (SELECT COUNT(*) FROM hr_employee_costs costs
   JOIN hr_employees e ON costs.employee_id = e.id
   JOIN companies c ON e.company_id = c.id
   WHERE c.nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017')) as costes_restantes;

-- RESULTADO ESPERADO: empleados_restantes = 0, costes_restantes = 0
