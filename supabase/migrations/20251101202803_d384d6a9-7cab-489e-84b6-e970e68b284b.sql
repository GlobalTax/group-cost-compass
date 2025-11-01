-- Actualizar vista vw_employee_annual para incluir hire_date y termination_date
DROP VIEW IF EXISTS vw_employee_annual;

CREATE VIEW vw_employee_annual AS
SELECT 
  e.id AS employee_id,
  e.full_name,
  e.hire_date,
  e.termination_date,
  c.name AS company,
  c.id AS company_id,
  e.org_id,
  EXTRACT(YEAR FROM ec.period)::integer AS year,
  e.annual_salary AS salario_base_anual,
  SUM(ec.bruto) AS bruto_cobrado_anual,
  SUM(ec.coste_empresa - ec.bruto) AS coste_ss_anual,
  COALESCE(bp.total_bonus, 0) AS bonus_pagado_anual,
  SUM(ec.coste_empresa) + COALESCE(bp.total_bonus, 0) AS coste_total_anual,
  
  d.id AS department_id,
  d.name AS department_name,
  d.color AS department_color,
  t.id AS team_id,
  t.name AS team_name
  
FROM hr_employees e
LEFT JOIN hr_employee_costs ec ON e.id = ec.employee_id
LEFT JOIN companies c ON e.company_id = c.id
LEFT JOIN departments d ON e.department_id = d.id
LEFT JOIN teams t ON e.team_id = t.id
LEFT JOIN (
  SELECT employee_id, 
         EXTRACT(YEAR FROM payment_date)::integer AS year,
         SUM(amount) AS total_bonus
  FROM bonus_payments
  GROUP BY employee_id, EXTRACT(YEAR FROM payment_date)::integer
) bp ON e.id = bp.employee_id AND EXTRACT(YEAR FROM ec.period)::integer = bp.year
WHERE ec.period IS NOT NULL
GROUP BY 
  e.id, e.full_name, e.hire_date, e.termination_date, e.annual_salary, 
  c.name, c.id, e.org_id,
  EXTRACT(YEAR FROM ec.period)::integer, bp.total_bonus,
  d.id, d.name, d.color, t.id, t.name;