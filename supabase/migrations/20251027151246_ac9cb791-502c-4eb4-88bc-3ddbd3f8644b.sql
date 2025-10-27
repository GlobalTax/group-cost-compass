-- =====================================================
-- FASE 2: Vistas Optimizadas para Dashboard (CORREGIDO)
-- =====================================================

-- Vista mensual agregada para dashboard
CREATE VIEW vw_dashboard_monthly AS
SELECT 
  date_trunc('month', c.period) as month,
  e.company_id,
  COUNT(DISTINCT c.employee_id) as employees_count,
  SUM(c.bruto) as total_bruto,
  SUM(c.coste_empresa) as total_coste
FROM hr_employee_costs c
INNER JOIN hr_employees e ON e.id = c.employee_id
GROUP BY date_trunc('month', c.period), e.company_id;

-- Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_costs_period_company_via_employee 
ON hr_employee_costs(period, employee_id);

CREATE INDEX IF NOT EXISTS idx_costs_employee_period 
ON hr_employee_costs(employee_id, period);

-- Vista materializada para resumen anual de costes
CREATE MATERIALIZED VIEW vw_employee_costs_summary AS
SELECT 
  e.id as employee_id,
  e.full_name,
  e.company_id,
  EXTRACT(YEAR FROM c.period)::INTEGER as year,
  SUM(c.bruto) as bruto_anual,
  SUM(c.coste_empresa) as coste_anual,
  COUNT(*) as meses_registrados
FROM hr_employees e
LEFT JOIN hr_employee_costs c ON c.employee_id = e.id
WHERE c.period IS NOT NULL
GROUP BY e.id, e.full_name, e.company_id, EXTRACT(YEAR FROM c.period);

-- Índices para la vista materializada
CREATE UNIQUE INDEX idx_employee_costs_summary_unique 
ON vw_employee_costs_summary (employee_id, year);

CREATE INDEX idx_employee_costs_summary_company_year 
ON vw_employee_costs_summary (company_id, year);

-- Refrescar vista
REFRESH MATERIALIZED VIEW CONCURRENTLY vw_employee_costs_summary;

COMMENT ON VIEW vw_dashboard_monthly IS 
'Vista optimizada para consultas de dashboard mensuales. Agrega costes por mes y empresa.';

COMMENT ON MATERIALIZED VIEW vw_employee_costs_summary IS 
'Resumen anual de costes por empleado. Refrescar tras importaciones: REFRESH MATERIALIZED VIEW CONCURRENTLY vw_employee_costs_summary;';