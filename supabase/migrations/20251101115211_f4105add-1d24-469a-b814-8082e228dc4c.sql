-- Fase 1: Añadir columnas department_id y team_id a hr_employees

-- Añadir columna department_id como FK a departments
ALTER TABLE hr_employees 
ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- Crear índice para mejorar performance
CREATE INDEX idx_employees_department ON hr_employees(department_id);

-- Añadir columna team_id como FK a teams
ALTER TABLE hr_employees 
ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Crear índice para mejorar performance
CREATE INDEX idx_employees_team ON hr_employees(team_id);

-- Actualizar vista vw_employee_annual para incluir departamento y equipo
DROP VIEW IF EXISTS vw_employee_annual;

CREATE VIEW vw_employee_annual AS
SELECT 
  e.id AS employee_id,
  e.full_name,
  c.name AS company,
  c.id AS company_id,
  e.org_id,
  EXTRACT(YEAR FROM ec.period)::integer AS year,
  e.annual_salary AS salario_base_anual,
  SUM(ec.bruto) AS bruto_cobrado_anual,
  SUM(ec.coste_empresa - ec.bruto) AS coste_ss_anual,
  COALESCE(bp.total_bonus, 0) AS bonus_pagado_anual,
  SUM(ec.coste_empresa) + COALESCE(bp.total_bonus, 0) AS coste_total_anual,
  
  -- Nuevos campos para departamento y equipo
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
  e.id, e.full_name, e.annual_salary, c.name, c.id, e.org_id,
  EXTRACT(YEAR FROM ec.period)::integer, bp.total_bonus,
  d.id, d.name, d.color, t.id, t.name;