-- ============================================================================
-- Actualizar vista vw_employee_annual para cálculo correcto de costes
-- ============================================================================

-- Eliminar vista anterior
DROP VIEW IF EXISTS vw_employee_annual;

-- Crear vista optimizada con cálculo correcto de SS empresa
CREATE OR REPLACE VIEW vw_employee_annual AS
WITH employee_years AS (
  SELECT 
    e.id AS employee_id,
    e.full_name,
    e.annual_salary AS salario_base_anual,
    c.name AS company,
    c.id AS company_id,
    EXTRACT(YEAR FROM ec.period)::int AS year,
    e.org_id,
    
    -- Totales anuales
    SUM(ec.bruto) AS bruto_cobrado_anual,
    SUM(ec.coste_empresa) AS coste_total_anual,
    
    -- Calcular SS empresa como diferencia (coste_empresa - bruto)
    SUM(ec.coste_empresa - ec.bruto) AS coste_ss_anual
    
  FROM hr_employee_costs ec
  JOIN hr_employees e ON e.id = ec.employee_id
  JOIN companies c ON c.id = e.company_id
  GROUP BY e.id, e.full_name, e.annual_salary, c.name, c.id, year, e.org_id
),
employee_bonus AS (
  SELECT 
    employee_id,
    fiscal_year,
    COALESCE(SUM(amount), 0) AS bonus_pagado_anual
  FROM bonus_payments
  GROUP BY employee_id, fiscal_year
)
SELECT 
  ey.employee_id,
  ey.full_name,
  ey.company,
  ey.company_id,
  ey.year,
  ey.org_id,
  
  -- CAMPOS CLAVE PARA CUADRO DE MANDO
  ey.salario_base_anual,           -- Negociado (puede ser > o < bruto_cobrado)
  ey.bruto_cobrado_anual,           -- Total cobrado en nóminas
  ey.coste_ss_anual,                -- Seguridad Social calculado correctamente
  COALESCE(eb.bonus_pagado_anual, 0) AS bonus_pagado_anual, -- Bonus efectivamente pagado
  ey.coste_total_anual              -- TOTAL empresa = bruto + SS
  
FROM employee_years ey
LEFT JOIN employee_bonus eb ON eb.employee_id = ey.employee_id AND eb.fiscal_year = ey.year;