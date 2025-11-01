-- =====================================================
-- COSTES DE PLANTILLA - OCTUBRE 2024
-- Grupo Navarro | Capittal
-- Fuente: A3Nom - Nóminas reales
-- =====================================================
--
-- Este script inserta los costes reales de octubre 2024
-- para los 56 empleados del grupo (5 empresas)
--
-- Distribución:
-- - Navarro Empresarial, SL: 36 empleados
-- - Beglobal Worldwide, SL: 7 empleados
-- - GoLooper, SL: 6 empleados
-- - Navarro Legal y Tributario, SLP: 1 empleado
-- - SPV Corporate Advisor, SL: 6 empleados
--
-- CAMPOS INSERTADOS:
-- - period: 2024-10-01 (inicio del mes)
-- - bruto: Salario bruto del periodo
-- - sal_neto: Salario neto (después de deducciones)
-- - coste_empresa: Coste total para la empresa
-- - total_tc1: Cuota de la Seguridad Social
--
-- =====================================================

-- =====================================================
-- NAVARRO EMPRESARIAL, SL (B67261542) - 36 empleados
-- =====================================================

-- Fiscal
INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  2291.66,
  2245.27,
  2302.17,
  11.07
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967001' AND c.nif = 'B67261542';

-- Contable
INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  6520.34,
  4656.91,
  6670.90,
  165.47
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967002' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  3500.00,
  2588.95,
  4622.45,
  1349.25
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967003' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  3500.00,
  2587.20,
  4622.45,
  1349.25
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967004' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  2784.16,
  2110.95,
  3677.04,
  1073.29
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967005' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  3940.67,
  2860.54,
  5204.45,
  1519.13
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967006' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  2127.08,
  1761.00,
  2809.23,
  819.99
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967007' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  1750.00,
  1453.01,
  2311.22,
  674.63
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967008' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  1750.00,
  1453.01,
  2311.22,
  674.63
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967009' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  495.83,
  454.50,
  655.90,
  192.42
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967010' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  270.00,
  264.04,
  280.51,
  11.07
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967011' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  540.00,
  528.64,
  550.51,
  11.07
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967012' AND c.nif = 'B67261542';

-- Laboral
INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  4166.67,
  2969.59,
  5502.92,
  1606.25
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967013' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  5083.33,
  3451.40,
  6659.16,
  1894.23
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967014' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  2583.33,
  2020.16,
  3411.80,
  995.87
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967015' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  2000.00,
  1586.40,
  2641.40,
  771.00
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967016' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  2941.34,
  2201.90,
  3884.63,
  1133.88
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967017' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  2741.34,
  2071.64,
  3620.49,
  1056.78
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967018' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  4166.67,
  2994.59,
  5502.92,
  1606.25
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967019' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  1875.00,
  1508.61,
  2476.32,
  722.83
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967020' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  3058.30,
  2015.04,
  4039.11,
  1178.99
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967021' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  2041.67,
  1600.36,
  2723.16,
  819.20
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967022' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  2500.00,
  1924.00,
  3301.75,
  963.75
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967023' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  625.00,
  611.94,
  635.51,
  11.07
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967024' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  1000.00,
  979.44,
  1010.51,
  11.07
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967025' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  1625.00,
  1384.65,
  2146.14,
  626.45
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967026' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  270.00,
  264.04,
  280.51,
  11.07
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967027' AND c.nif = 'B67261542';

-- Servicios Auxiliares
INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  2029.92,
  1601.00,
  2680.92,
  782.54
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967028' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  1833.33,
  1495.08,
  2421.28,
  706.75
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967029' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  1556.75,
  1329.71,
  2064.00,
  609.75
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967030' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  1912.49,
  1501.69,
  2525.82,
  737.26
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967031' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  450.97,
  442.51,
  450.97,
  0.00
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967032' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  260.00,
  254.24,
  270.51,
  11.07
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967033' AND c.nif = 'B67261542';

-- Call Center MCD
INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  2666.66,
  2043.14,
  3541.89,
  1052.08
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967034' AND c.nif = 'B67261542';

INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  2000.00,
  1588.95,
  2661.46,
  795.11
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967035' AND c.nif = 'B67261542';

-- M&A
INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id,
  '2024-10-01'::date,
  1600.00,
  1567.44,
  1610.51,
  11.07
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.employee_code = '99967036' AND c.nif = 'B67261542';

-- =====================================================
-- RESTO DE EMPRESAS - PENDIENTE DE DATOS
-- =====================================================
-- 
-- TODO: Añadir costes de octubre 2024 para:
-- - Beglobal Worldwide, SL (B09835315) - 7 empleados
-- - GoLooper, SL (B02721918) - 6 empleados  
-- - Navarro Legal y Tributario, SLP (B67261552) - 1 empleado
-- - SPV Corporate Advisor, SL (B09652017) - 6 empleados
--
-- =====================================================

-- =====================================================
-- QUERIES DE VERIFICACIÓN
-- =====================================================

-- Verificar total de costes insertados por empresa
SELECT 
  c.name as empresa,
  COUNT(*) as total_registros,
  SUM(bruto) as total_bruto,
  SUM(coste_empresa) as total_coste
FROM hr_employee_costs costs
JOIN hr_employees e ON costs.employee_id = e.id
JOIN companies c ON e.company_id = c.id
WHERE costs.period = '2024-10-01'
  AND c.nif IN ('B67261542', 'B67261552', 'B09835315', 'B02721918', 'B09652017')
GROUP BY c.name
ORDER BY c.name;

-- RESULTADOS ESPERADOS (al completar):
-- Navarro Empresarial: 36 registros | Bruto: 80.528,34€ | Coste: 102.175,29€
-- Beglobal Worldwide: 7 registros
-- GoLooper: 6 registros
-- Navarro Legal: 1 registro
-- SPV Corporate: 6 registros
-- TOTAL: 56 registros
