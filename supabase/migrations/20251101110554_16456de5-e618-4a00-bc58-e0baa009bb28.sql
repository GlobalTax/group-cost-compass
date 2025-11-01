-- Agregar campo annual_salary a hr_employees
ALTER TABLE hr_employees 
ADD COLUMN annual_salary NUMERIC(14,2);

COMMENT ON COLUMN hr_employees.annual_salary IS 
'Salario base anual negociado/acordado con el empleado (bruto anual sin bonus ni extras). Usado como referencia para revisiones salariales y comparativas de banda.';

-- Recrear vista vw_employee_annual para incluir el salario base negociado
DROP VIEW IF EXISTS vw_employee_annual;

CREATE VIEW vw_employee_annual AS
WITH employee_years AS (
  SELECT 
    e.id as employee_id,
    e.full_name,
    e.annual_salary as salario_base_anual,
    c.name as company,
    c.id as company_id,
    EXTRACT(YEAR FROM ec.period)::int as year,
    e.org_id,
    SUM(ec.bruto) as bruto_anual,
    SUM(ec.coste_empresa) as coste_anual,
    SUM(ec.sal_neto) as salario_neto_anual,
    SUM(ec.ss_empresa) as coste_ss_anual,
    AVG(ec.bruto) as salario_mensual_promedio,
    AVG(ec.ss_empresa) as coste_ss_mensual_promedio
  FROM hr_employee_costs ec
  JOIN hr_employees e ON e.id = ec.employee_id
  JOIN companies c ON c.id = e.company_id
  GROUP BY e.id, e.full_name, e.annual_salary, c.name, c.id, year, e.org_id
)
SELECT 
  ey.*,
  COALESCE((
    SELECT SUM(bp.amount)
    FROM bonus_payments bp
    WHERE bp.employee_id = ey.employee_id 
    AND bp.fiscal_year = ey.year
  ), 0) as bonus_anual,
  COALESCE((
    SELECT SUM(bp.amount)
    FROM bonus_payments bp
    WHERE bp.employee_id = ey.employee_id 
    AND bp.fiscal_year = ey.year
  ), 0) as bonus_pagado
FROM employee_years ey;