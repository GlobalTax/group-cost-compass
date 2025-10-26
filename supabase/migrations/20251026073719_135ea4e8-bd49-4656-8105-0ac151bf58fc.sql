-- Insertar traslados
WITH default_org AS (
  SELECT id FROM public.organizations LIMIT 1
)
INSERT INTO hr_transfers (employee_id, from_company, to_company, transfer_date, days_between, reason, org_id)
SELECT 
  e.id,
  cf.id AS from_company,
  ct.id AS to_company,
  t.transfer_date,
  CASE 
    WHEN t.prev_termination_date IS NOT NULL 
    THEN (t.transfer_date - t.prev_termination_date) 
    ELSE 1 
  END AS days_between,
  t.reason,
  (SELECT id FROM default_org)
FROM (VALUES
  ('000001B', 'B09652017', 'B67261552', '2025-01-01'::date, '2024-12-31'::date, 'Traslado SPV → Navarro Legal'),
  ('000002B', 'B09652017', 'B67261552', '2025-01-01'::date, '2024-12-31'::date, 'Traslado SPV → Navarro Legal'),
  ('000009', 'B58068800', 'B67261552', '2025-09-16'::date, NULL, 'Reincorporada Grupo Navarro')
) AS t(employee_code, from_nif, to_nif, transfer_date, prev_termination_date, reason)
JOIN hr_employees e ON e.employee_code = t.employee_code
JOIN companies cf ON cf.nif = t.from_nif
JOIN companies ct ON ct.nif = t.to_nif;