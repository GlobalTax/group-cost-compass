-- ============================================================================
-- Script de Backfill: annual_salary para empleados existentes
-- ============================================================================
-- Objetivo: Poblar hr_employees.annual_salary basándose en el promedio 
--           de bruto de los últimos 3 meses de costes.
-- 
-- Uso: Ejecutar manualmente desde el SQL Editor de Supabase
-- ============================================================================

-- Calcular annual_salary para empleados que no lo tienen
-- basándose en el promedio de bruto de los últimos 3 meses

WITH recent_costs AS (
  SELECT 
    employee_id,
    AVG(bruto) AS avg_monthly_bruto,
    COUNT(*) AS months_count
  FROM (
    SELECT DISTINCT ON (employee_id, period)
      employee_id,
      bruto,
      period
    FROM hr_employee_costs
    WHERE bruto IS NOT NULL AND bruto > 0
    ORDER BY employee_id, period DESC
  ) last_costs
  GROUP BY employee_id
  HAVING COUNT(*) >= 1
)
UPDATE hr_employees e
SET 
  annual_salary = ROUND((rc.avg_monthly_bruto * 12)::numeric, 2),
  updated_at = now()
FROM recent_costs rc
WHERE e.id = rc.employee_id
  AND e.annual_salary IS NULL
  AND rc.avg_monthly_bruto > 0;

-- Verificar resultado
SELECT 
  COUNT(*) FILTER (WHERE annual_salary IS NOT NULL) AS empleados_con_salario,
  COUNT(*) FILTER (WHERE annual_salary IS NULL) AS empleados_sin_salario,
  COUNT(*) AS total_empleados,
  ROUND(AVG(annual_salary)::numeric, 2) AS salario_medio_anual
FROM hr_employees
WHERE is_active = true
  OR termination_date IS NULL 
  OR termination_date > CURRENT_DATE;

-- Ver detalle de empleados actualizados (últimos 10)
SELECT 
  full_name,
  company_id,
  hire_date,
  annual_salary,
  updated_at
FROM hr_employees
WHERE annual_salary IS NOT NULL
  AND updated_at > (now() - INTERVAL '5 minutes')
ORDER BY updated_at DESC
LIMIT 10;
