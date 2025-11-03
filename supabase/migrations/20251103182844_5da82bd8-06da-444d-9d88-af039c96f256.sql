-- Migración: Limpieza automática de empleados duplicados
-- Criterios de priorización:
--   1. Mayor cantidad de costes asociados
--   2. Tiene salario anual definido
--   3. Salario más alto
--   4. Registro más antiguo

BEGIN;

-- Tabla temporal para registrar eliminaciones
CREATE TEMP TABLE deleted_duplicates (
  id UUID,
  full_name TEXT,
  company_id UUID,
  employee_code TEXT,
  annual_salary NUMERIC,
  costs_count INTEGER,
  created_at TIMESTAMPTZ
);

-- Identificar y almacenar duplicados a eliminar
WITH employee_costs_count AS (
  SELECT 
    employee_id,
    COUNT(*) as costs_count
  FROM hr_employee_costs
  GROUP BY employee_id
),
ranked_employees AS (
  SELECT 
    e.id,
    e.full_name,
    e.company_id,
    e.employee_code,
    e.annual_salary,
    e.created_at,
    COALESCE(ecc.costs_count, 0) as costs_count,
    ROW_NUMBER() OVER (
      PARTITION BY e.full_name, e.company_id 
      ORDER BY 
        COALESCE(ecc.costs_count, 0) DESC,
        CASE WHEN e.annual_salary IS NOT NULL THEN 1 ELSE 0 END DESC,
        e.annual_salary DESC NULLS LAST,
        e.created_at ASC
    ) as rank
  FROM hr_employees e
  LEFT JOIN employee_costs_count ecc ON e.id = ecc.employee_id
  WHERE (e.full_name, e.company_id) IN (
    SELECT full_name, company_id 
    FROM hr_employees 
    GROUP BY full_name, company_id 
    HAVING COUNT(*) > 1
  )
),
duplicates_to_delete AS (
  SELECT id, full_name, company_id, employee_code, annual_salary, costs_count, created_at
  FROM ranked_employees 
  WHERE rank > 1
)
INSERT INTO deleted_duplicates
SELECT * FROM duplicates_to_delete;

-- Registrar en audit_logs antes de eliminar
INSERT INTO audit_logs (
  table_name,
  record_id,
  action,
  old_data,
  new_data,
  created_at,
  user_id
)
SELECT 
  'hr_employees',
  dd.id,
  'DELETE',
  jsonb_build_object(
    'id', dd.id,
    'full_name', dd.full_name,
    'company_id', dd.company_id,
    'employee_code', dd.employee_code,
    'annual_salary', dd.annual_salary,
    'costs_count', dd.costs_count,
    'created_at', dd.created_at,
    'reason', 'Eliminación automática de duplicado'
  ),
  NULL,
  NOW(),
  NULL
FROM deleted_duplicates dd;

-- Eliminar duplicados
DELETE FROM hr_employees
WHERE id IN (SELECT id FROM deleted_duplicates);

-- Resumen de la operación
DO $$
DECLARE
  total_deleted INTEGER;
  groups_affected INTEGER;
  companies_affected INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_deleted FROM deleted_duplicates;
  SELECT COUNT(DISTINCT full_name) INTO groups_affected FROM deleted_duplicates;
  SELECT COUNT(DISTINCT company_id) INTO companies_affected FROM deleted_duplicates;
  
  RAISE NOTICE '✅ Limpieza completada:';
  RAISE NOTICE '   - Registros eliminados: %', total_deleted;
  RAISE NOTICE '   - Grupos de duplicados afectados: %', groups_affected;
  RAISE NOTICE '   - Empresas afectadas: %', companies_affected;
END $$;

-- Verificación final: No deben quedar duplicados
DO $$
DECLARE
  remaining_duplicates INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_duplicates
  FROM (
    SELECT full_name, company_id 
    FROM hr_employees 
    GROUP BY full_name, company_id 
    HAVING COUNT(*) > 1
  ) dupes;
  
  IF remaining_duplicates > 0 THEN
    RAISE EXCEPTION 'Error: Todavía quedan % grupos duplicados', remaining_duplicates;
  END IF;
  
  RAISE NOTICE '✅ Verificación completada: 0 duplicados restantes';
END $$;

COMMIT;