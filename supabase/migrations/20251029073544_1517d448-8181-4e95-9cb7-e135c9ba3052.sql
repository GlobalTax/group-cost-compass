-- Eliminar vista existente
DROP VIEW IF EXISTS public.vw_employee_annual CASCADE;

-- Crear vista mejorada con campos detallados de nómina
CREATE VIEW public.vw_employee_annual AS
SELECT 
  e.id as employee_id,
  e.full_name,
  c.name as company,
  c.id as company_id,
  EXTRACT(YEAR FROM ec.period)::int as year,
  e.org_id,
  
  -- Totales anuales
  SUM(COALESCE(ec.bruto, 0)) as bruto_anual,
  SUM(COALESCE(ec.coste_empresa, 0)) as coste_anual,
  SUM(COALESCE(ec.sal_neto, 0)) as salario_neto_anual,
  SUM(COALESCE(ec.ss_empresa, 0)) as coste_ss_anual,
  SUM(COALESCE(ec.bonificacion, 0)) as bonus_anual,
  
  -- Promedios mensuales
  AVG(COALESCE(ec.bruto, 0)) as salario_mensual_promedio,
  AVG(COALESCE(ec.ss_empresa, 0)) as coste_ss_mensual_promedio,
  
  -- Bonus pagado (solo meses donde hubo bonificación)
  SUM(COALESCE(ec.bonificacion, 0)) FILTER (WHERE ec.bonificacion IS NOT NULL AND ec.bonificacion > 0) as bonus_pagado
  
FROM public.hr_employee_costs ec
JOIN public.hr_employees e ON e.id = ec.employee_id
JOIN public.companies c ON c.id = e.company_id
GROUP BY e.id, e.full_name, c.name, c.id, year, e.org_id;

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_vw_employee_annual_lookup 
ON public.hr_employee_costs(employee_id, period);

COMMENT ON VIEW public.vw_employee_annual IS 
'Vista optimizada con agregados anuales de costes de empleados, incluyendo salarios netos, costes SS y bonificaciones';