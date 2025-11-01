-- =====================================================
-- PASO 3: INSERTAR COSTES OCTUBRE 2024
-- Grupo Navarro | Capittal
-- =====================================================
-- Inserta 55 registros de costes para el periodo 2024-10-01
-- según la tabla Excel proporcionada por el usuario
-- =====================================================

-- Deshabilitar temporalmente el trigger de estimación de salario
ALTER TABLE hr_employee_costs DISABLE TRIGGER estimate_salary_on_first_cost;

-- =====================================================
-- NAVARRO EMPRESARIAL (B58068800) - 36 registros
-- =====================================================
INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id as employee_id,
  '2024-10-01'::date as period,
  t.bruto,
  t.sal_neto,
  t.coste_empresa,
  t.total_tc1
FROM (VALUES
  ('NE001', 2291.66, 2245.27, 2302.17, 11.07),
  ('NE002', 6520.34, 4656.91, 6670.90, 165.47),
  ('NE003', 3500.00, 2588.95, 4622.45, 1349.25),
  ('NE004', 3500.00, 2587.20, 4622.45, 1349.25),
  ('NE005', 2784.16, 2110.95, 3677.04, 1073.29),
  ('NE006', 3940.67, 2860.54, 5204.45, 1519.13),
  ('NE007', 2127.08, 1761.00, 2809.23, 819.99),
  ('NE008', 1750.00, 1453.01, 2311.22, 674.63),
  ('NE009', 1750.00, 1453.01, 2311.22, 674.63),
  ('NE010', 495.83, 454.50, 655.90, 192.42),
  ('NE011', 270.00, 264.04, 280.51, 11.07),
  ('NE012', 540.00, 528.64, 550.51, 11.07),
  ('NE013', 4166.67, 2969.59, 5502.92, 1606.25),
  ('NE014', 5083.33, 3451.40, 6659.16, 1894.23),
  ('NE015', 2583.33, 2020.16, 3411.80, 995.87),
  ('NE016', 2000.00, 1586.40, 2641.40, 771.00),
  ('NE017', 2941.34, 2201.90, 3884.63, 1133.88),
  ('NE018', 2741.34, 2071.64, 3620.49, 1056.78),
  ('NE019', 4166.67, 2994.59, 5502.92, 1606.25),
  ('NE020', 1875.00, 1508.61, 2476.32, 722.83),
  ('NE021', 3058.30, 2015.04, 4039.11, 1178.99),
  ('NE022', 2041.67, 1600.36, 2723.16, 819.20),
  ('NE023', 2500.00, 1924.00, 3301.75, 963.75),
  ('NE024', 625.00, 611.94, 635.51, 11.07),
  ('NE025', 1000.00, 979.44, 1010.51, 11.07),
  ('NE026', 1625.00, 1384.65, 2146.14, 626.45),
  ('NE027', 270.00, 264.04, 280.51, 11.07),
  ('NE028', 2029.92, 1601.00, 2680.92, 782.54),
  ('NE029', 1833.33, 1495.08, 2421.28, 706.75),
  ('NE030', 1556.75, 1329.71, 2064.00, 609.75),
  ('NE031', 1912.49, 1501.69, 2525.82, 737.26),
  ('NE032', 450.97, 442.51, 450.97, 0.00),
  ('NE033', 260.00, 254.24, 270.51, 11.07),
  ('NE034', 2666.66, 2043.14, 3541.89, 1052.08),
  ('NE035', 2000.00, 1588.95, 2661.46, 795.11),
  ('NE036', 1600.00, 1567.44, 1610.51, 11.07)
) AS t(employee_code, bruto, sal_neto, coste_empresa, total_tc1)
JOIN hr_employees e ON e.employee_code = t.employee_code
JOIN companies c ON e.company_id = c.id
WHERE c.nif = 'B58068800';

-- =====================================================
-- NAVARRO LEGAL Y TRIBUTARIO (B67261552) - 6 registros
-- Marina González Olivé no tiene bruto/neto, solo coste empresa
-- =====================================================
INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id as employee_id,
  '2024-10-01'::date as period,
  t.bruto,
  t.sal_neto,
  t.coste_empresa,
  t.total_tc1
FROM (VALUES
  ('NL001', 1310.60, 1284.04, 1321.11, 11.07),
  ('NL002', NULL, NULL, 1068.99, 0.00),
  ('NL003', 2500.00, 1927.50, 3301.75, 963.75),
  ('NL004', 1400.00, 1371.44, 1410.51, 11.07),
  ('NL005', 3166.67, 2369.62, 4182.22, 1220.75),
  ('NL006', 310.80, 148.84, 427.37, 138.67),
  ('NL007', 1161.11, 866.77, 1533.48, 447.61)
) AS t(employee_code, bruto, sal_neto, coste_empresa, total_tc1)
JOIN hr_employees e ON e.employee_code = t.employee_code
JOIN companies c ON e.company_id = c.id
WHERE c.nif = 'B67261552';

-- =====================================================
-- BEGLOBAL WORLDWIDE (B09835315) - 6 registros
-- =====================================================
INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id as employee_id,
  '2024-10-01'::date as period,
  t.bruto,
  t.sal_neto,
  t.coste_empresa,
  t.total_tc1
FROM (VALUES
  ('BG001', 4583.33, 3208.33, 6053.20, 1766.87),
  ('BG002', 1916.66, 1524.13, 2531.32, 738.86),
  ('BG003', 270.00, 264.04, 280.51, 11.07),
  ('BG004', 499.24, 437.09, 659.33, 192.44),
  ('BG005', 333.33, 257.00, 440.23, 128.50),
  ('BG006', 765.31, 700.00, 1019.95, 304.64)
) AS t(employee_code, bruto, sal_neto, coste_empresa, total_tc1)
JOIN hr_employees e ON e.employee_code = t.employee_code
JOIN companies c ON e.company_id = c.id
WHERE c.nif = 'B09835315';

-- =====================================================
-- GOLOOPER (B02721918) - 6 registros
-- =====================================================
INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id as employee_id,
  '2024-10-01'::date as period,
  t.bruto,
  t.sal_neto,
  t.coste_empresa,
  t.total_tc1
FROM (VALUES
  ('GL001', 1600.00, 1296.00, 1600.00, 0.00),
  ('GL002', 400.00, 391.44, 410.51, 11.07),
  ('GL003', 200.00, 184.84, 263.68, 74.84),
  ('GL004', 3773.36, 3320.00, 3783.87, 11.07),
  ('GL005', 2098.64, 1880.03, 2109.15, 11.07),
  ('GL006', 1786.14, 1600.00, 1796.65, 11.07)
) AS t(employee_code, bruto, sal_neto, coste_empresa, total_tc1)
JOIN hr_employees e ON e.employee_code = t.employee_code
JOIN companies c ON e.company_id = c.id
WHERE c.nif = 'B02721918';

-- =====================================================
-- SPV CORPORATE ADVISOR (B09652017) - 1 registro
-- =====================================================
INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT 
  e.id as employee_id,
  '2024-10-01'::date as period,
  t.bruto,
  t.sal_neto,
  t.coste_empresa,
  t.total_tc1
FROM (VALUES
  ('SPV001', 2537.50, 1992.19, 3357.62, 984.55)
) AS t(employee_code, bruto, sal_neto, coste_empresa, total_tc1)
JOIN hr_employees e ON e.employee_code = t.employee_code
JOIN companies c ON e.company_id = c.id
WHERE c.nif = 'B09652017';

-- Rehabilitar el trigger
ALTER TABLE hr_employee_costs ENABLE TRIGGER estimate_salary_on_first_cost;

-- =====================================================
-- VERIFICACIÓN POST-INSERCIÓN DE COSTES
-- =====================================================

-- Contar costes por empresa
SELECT 
  c.name as empresa,
  c.nif,
  COUNT(*) as total_costes,
  ROUND(SUM(costs.coste_empresa)::numeric, 2) as suma_coste_empresa
FROM hr_employee_costs costs
JOIN hr_employees e ON costs.employee_id = e.id
JOIN companies c ON e.company_id = c.id
WHERE c.nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017')
  AND costs.period = '2024-10-01'
GROUP BY c.name, c.nif
ORDER BY c.name;

-- Total general
SELECT 
  'TOTAL GENERAL' as status,
  COUNT(*) as total_costes,
  ROUND(SUM(coste_empresa)::numeric, 2) as suma_coste_empresa
FROM hr_employee_costs costs
JOIN hr_employees e ON costs.employee_id = e.id
JOIN companies c ON e.company_id = c.id
WHERE c.nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017')
  AND costs.period = '2024-10-01';

-- RESULTADO ESPERADO:
-- Navarro Empresarial: 36 costes | 102,175.29 €
-- Navarro Legal: 7 costes | 13,245.43 €
-- BeGlobal: 6 costes | 10,984.54 €
-- GoLooper: 6 costes | 9,963.86 €
-- SPV Corporate: 1 coste | 3,357.62 €
-- TOTAL: 56 costes | 139,726.74 €
