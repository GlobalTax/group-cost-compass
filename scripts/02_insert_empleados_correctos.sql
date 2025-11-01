-- =====================================================
-- PASO 2: INSERTAR EMPLEADOS CORRECTAMENTE
-- Grupo Navarro | Capittal - Octubre 2024
-- =====================================================
-- Inserta 56 empleados con las asignaciones correctas según Excel
-- Navarro Empresarial: 36 | Navarro Legal: 7 | BeGlobal: 6
-- GoLooper: 6 | SPV Corporate: 1
-- =====================================================

-- =====================================================
-- NAVARRO EMPRESARIAL (B58068800) - 36 empleados
-- =====================================================
INSERT INTO hr_employees (employee_code, full_name, company_id, org_id, hire_date, department, notes)
SELECT 
  employee_code,
  full_name,
  (SELECT id FROM companies WHERE nif = 'B58068800') as company_id,
  (SELECT org_id FROM companies WHERE nif = 'B58068800') as org_id,
  hire_date,
  department,
  'Importado desde A3Nom - Octubre 2024 - Asignación corregida'
FROM (VALUES
  ('NE001', 'Pol Fontclara Coch', '2020-01-15'::date, 'Fiscal'),
  ('NE002', 'José María Arguello Planas', '2015-03-01'::date, 'Contable'),
  ('NE003', 'María Rosa Rodríguez Martínez', '2018-06-01'::date, 'Contable'),
  ('NE004', 'María Sierra León López', '2019-02-01'::date, 'Contable'),
  ('NE005', 'Anita Isabel Ramírez Rivas', '2020-07-01'::date, 'Contable'),
  ('NE006', 'José Rico Haro', '2017-04-01'::date, 'Contable'),
  ('NE007', 'Yolanda Pescador Isar', '2021-05-01'::date, 'Contable'),
  ('NE008', 'Vasyl Lenko', '2022-01-15'::date, 'Contable'),
  ('NE009', 'Paula Cárdenas Dacasa', '2022-09-01'::date, 'Contable'),
  ('NE010', 'Clàudia Varela Arenas', '2024-09-01'::date, 'Contable'),
  ('NE011', 'Martina Sánchez Palacios', '2024-09-01'::date, 'Contable'),
  ('NE012', 'Jaume García Peña', '2024-09-01'::date, 'Contable'),
  ('NE013', 'Magdalena Vidueira Real', '2019-01-15'::date, 'Laboral'),
  ('NE014', 'Joan Salvo Martínez', '2016-06-01'::date, 'Laboral'),
  ('NE015', 'Mónica Castro Morales', '2020-03-01'::date, 'Laboral'),
  ('NE016', 'Adrián Muñoz Vega', '2021-08-01'::date, 'Laboral'),
  ('NE017', 'Irene Velarde Portillo', '2019-10-01'::date, 'Laboral'),
  ('NE018', 'Adrià Montero Porcel', '2020-11-01'::date, 'Laboral'),
  ('NE019', 'Estela Borrell López', '2018-02-01'::date, 'Laboral'),
  ('NE020', 'Eric Abellán Calvo', '2022-06-01'::date, 'Laboral'),
  ('NE021', 'Raúl Rubio Delvalle', '2020-05-01'::date, 'Laboral'),
  ('NE022', 'Raquel Chica Coca', '2021-07-01'::date, 'Laboral'),
  ('NE023', 'Alejandro Brotons Borrell', '2019-09-01'::date, 'Laboral'),
  ('NE024', 'Aitana López Tamayo', '2024-09-01'::date, 'Laboral'),
  ('NE025', 'Laia Moll Morillas', '2024-09-01'::date, 'Laboral'),
  ('NE026', 'Yasmina Aguilera Tejada', '2023-04-01'::date, 'Laboral'),
  ('NE027', 'Mia Lisbeth Fernández Cáceres', '2024-09-01'::date, 'Laboral'),
  ('NE028', 'Antonia María Díaz Muñoz', '2020-01-15'::date, 'Servicios Auxiliares'),
  ('NE029', 'Lucía Linares Pérez', '2021-03-01'::date, 'Servicios Auxiliares'),
  ('NE030', 'Gemma Zalacaín Granados', '2022-06-01'::date, 'Servicios Auxiliares'),
  ('NE031', 'Carolina Sacco Moriconi', '2019-08-01'::date, 'Servicios Auxiliares'),
  ('NE032', 'Roc Serra Val', '2024-10-01'::date, 'Servicios Auxiliares'),
  ('NE033', 'Blanca Salvo Nogueras', '2024-09-01'::date, 'Servicios Auxiliares'),
  ('NE034', 'Alba Virto Sanz', '2021-11-01'::date, 'Call Center MCD'),
  ('NE035', 'Sara Sanz Hernández', '2022-04-01'::date, 'Call Center MCD'),
  ('NE036', 'Oriol Iglesias Ayuso', '2024-09-01'::date, 'M&A')
) AS t(employee_code, full_name, hire_date, department);

-- =====================================================
-- NAVARRO LEGAL Y TRIBUTARIO (B67261552) - 7 empleados
-- =====================================================
INSERT INTO hr_employees (employee_code, full_name, company_id, org_id, hire_date, department, notes)
SELECT 
  employee_code,
  full_name,
  (SELECT id FROM companies WHERE nif = 'B67261552') as company_id,
  (SELECT org_id FROM companies WHERE nif = 'B67261552') as org_id,
  hire_date,
  department,
  'Importado desde A3Nom - Octubre 2024 - Asignación corregida'
FROM (VALUES
  ('NL001', 'Nil Moreno Forment', '2024-01-15'::date, 'Fiscal / Prácticas'),
  ('NL002', 'Marina González Olivé', '2023-06-01'::date, 'Mercantil'),
  ('NL003', 'Clara Bellonch Boter', '2021-03-01'::date, 'Mercantil'),
  ('NL004', 'Joan Nebot Gaspar', '2024-09-01'::date, 'Mercantil'),
  ('NL005', 'Ana Isabel Raso Ovejero', '2019-04-01'::date, 'Auxiliares'),
  ('NL006', 'Rosmeri Velasco Pérez', '2024-09-15'::date, 'Auxiliares'),
  ('NL007', 'Julia Estelle Carcelle', '2023-08-01'::date, 'M&A')
) AS t(employee_code, full_name, hire_date, department);

-- =====================================================
-- BEGLOBAL WORLDWIDE (B09835315) - 6 empleados
-- =====================================================
INSERT INTO hr_employees (employee_code, full_name, company_id, org_id, hire_date, department, notes)
SELECT 
  employee_code,
  full_name,
  (SELECT id FROM companies WHERE nif = 'B09835315') as company_id,
  (SELECT org_id FROM companies WHERE nif = 'B09835315') as org_id,
  hire_date,
  department,
  'Importado desde A3Nom - Octubre 2024 - Asignación corregida'
FROM (VALUES
  ('BG001', 'Jordi Majoral Marsal', '2018-05-01'::date, 'Contable'),
  ('BG002', 'Pau Valls Viñals', '2021-09-01'::date, 'Contable'),
  ('BG003', 'Adam Sánchez Palacios', '2024-09-01'::date, 'Contable'),
  ('BG004', 'Víctor Asensio Martínez', '2024-09-01'::date, 'Contable'),
  ('BG005', 'Cinthia Paola Sánchez Villarroel', '2024-08-01'::date, 'Contable'),
  ('BG006', 'Mirian Zuyapa Meléndez Peña', '2024-08-15'::date, 'Auxiliares')
) AS t(employee_code, full_name, hire_date, department);

-- =====================================================
-- GOLOOPER (B02721918) - 6 empleados
-- =====================================================
INSERT INTO hr_employees (employee_code, full_name, company_id, org_id, hire_date, department, notes)
SELECT 
  employee_code,
  full_name,
  (SELECT id FROM companies WHERE nif = 'B02721918') as company_id,
  (SELECT org_id FROM companies WHERE nif = 'B02721918') as org_id,
  hire_date,
  department,
  'Importado desde A3Nom - Octubre 2024 - Asignación corregida'
FROM (VALUES
  ('GL001', 'Lluís Miquel Montanyà Raidó', '2022-01-15'::date, 'M&A'),
  ('GL002', 'Pau Serra de la Cruz', '2024-09-01'::date, 'M&A'),
  ('GL003', 'Albert Tico Puigvert', '2024-09-15'::date, 'M&A'),
  ('GL004', 'Pau Rifà Gomà-Camps', '2023-03-01'::date, 'M&A'),
  ('GL005', 'Marc Tico Puigvert', '2023-07-01'::date, 'M&A'),
  ('GL006', 'Marc Canet Ripoll', '2023-05-15'::date, 'M&A')
) AS t(employee_code, full_name, hire_date, department);

-- =====================================================
-- SPV CORPORATE ADVISOR (B09652017) - 1 empleado
-- =====================================================
INSERT INTO hr_employees (employee_code, full_name, company_id, org_id, hire_date, department, notes)
SELECT 
  employee_code,
  full_name,
  (SELECT id FROM companies WHERE nif = 'B09652017') as company_id,
  (SELECT org_id FROM companies WHERE nif = 'B09652017') as org_id,
  hire_date,
  department,
  'Importado desde A3Nom - Octubre 2024 - Asignación corregida'
FROM (VALUES
  ('SPV001', 'Vicente Sánchez Alberto', '2020-06-01'::date, 'Auxiliares')
) AS t(employee_code, full_name, hire_date, department);

-- =====================================================
-- VERIFICACIÓN POST-INSERCIÓN
-- =====================================================

-- Contar empleados por empresa
SELECT 
  c.name as empresa,
  c.nif,
  COUNT(*) as total_empleados
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE c.nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017')
GROUP BY c.name, c.nif
ORDER BY c.name;

-- Total general
SELECT 
  'TOTAL GENERAL' as status,
  COUNT(*) as total_empleados
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE c.nif IN ('B58068800', 'B67261552', 'B09835315', 'B02721918', 'B09652017');

-- RESULTADO ESPERADO:
-- Navarro Empresarial: 36
-- Navarro Legal: 7
-- BeGlobal: 6
-- GoLooper: 6
-- SPV Corporate: 1
-- TOTAL: 56
