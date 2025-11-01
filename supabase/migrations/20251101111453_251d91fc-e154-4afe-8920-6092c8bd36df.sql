-- ============================================================================
-- Población automática de annual_salary usando estimación (bruto × 14)
-- ============================================================================

-- 1. Poblar annual_salary de empleados existentes con nóminas registradas
UPDATE hr_employees e
SET annual_salary = (
  SELECT (bruto * 14)
  FROM hr_employee_costs
  WHERE employee_id = e.id
  ORDER BY period DESC
  LIMIT 1
)
WHERE annual_salary IS NULL
AND EXISTS (
  SELECT 1 FROM hr_employee_costs WHERE employee_id = e.id
);

-- 2. Documentar el campo con comentario explicativo
COMMENT ON COLUMN hr_employees.annual_salary IS 
'Salario base anual negociado (€). Si NULL al crear empleado, se estima automáticamente como último_bruto_mensual × 14 pagas estándar España.';

-- 3. Función para auto-estimar annual_salary en primera nómina
CREATE OR REPLACE FUNCTION auto_estimate_annual_salary()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Si el empleado no tiene annual_salary configurado, estimarlo automáticamente
  UPDATE hr_employees
  SET annual_salary = (NEW.bruto * 14)
  WHERE id = NEW.employee_id
  AND annual_salary IS NULL;
  
  RETURN NEW;
END;
$$;

-- 4. Trigger que ejecuta la estimación al insertar costes de nómina
DROP TRIGGER IF EXISTS estimate_salary_on_first_cost ON hr_employee_costs;

CREATE TRIGGER estimate_salary_on_first_cost
AFTER INSERT ON hr_employee_costs
FOR EACH ROW
EXECUTE FUNCTION auto_estimate_annual_salary();

-- Verificación: Mostrar empleados con salary estimado
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM hr_employees
  WHERE annual_salary IS NOT NULL;
  
  RAISE NOTICE 'Empleados con annual_salary configurado: %', updated_count;
END $$;