-- Vista agregada de costes mensuales por empresa
-- Usado en dashboard de comparativa de costes por empresa

CREATE OR REPLACE VIEW public.vw_company_costs_monthly AS
SELECT 
  c.id AS company_id,
  c.name AS company_name,
  c.org_id,
  ec.period,
  EXTRACT(YEAR FROM ec.period)::INTEGER AS year,
  EXTRACT(MONTH FROM ec.period)::INTEGER AS month,
  COUNT(DISTINCT ec.employee_id) AS num_employees,
  SUM(ec.bruto) AS bruto_mensual,
  SUM(ec.coste_empresa) AS coste_empresa_mensual
FROM hr_employee_costs ec
JOIN hr_employees e ON e.id = ec.employee_id
JOIN companies c ON c.id = e.company_id
GROUP BY c.id, c.name, c.org_id, ec.period
ORDER BY ec.period DESC, c.name;

COMMENT ON VIEW public.vw_company_costs_monthly IS 'Agregación mensual de costes por empresa para dashboard y comparativas YoY';