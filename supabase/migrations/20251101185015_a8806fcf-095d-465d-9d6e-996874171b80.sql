-- Corregir período de octubre 2024 a octubre 2025
-- Solo para registros importados recientemente (últimos 7 días para seguridad)
UPDATE hr_employee_costs
SET period = '2025-10-01'
WHERE period = '2024-10-01'
  AND created_at >= CURRENT_DATE - INTERVAL '7 days';