-- Script de importación de empleados reales de Navarro Empresarial, SL
-- Fuente: A3Nom Octubre 2024
-- NIF: B58068800
-- Total empleados: 36

-- Insertar los 36 empleados reales del archivo A3Nom
INSERT INTO hr_employees (
  employee_code,
  full_name,
  company_id,
  org_id,
  hire_date,
  department,
  notes
) VALUES
  -- 01 DEPARTAMENTO FISCAL (1 empleado)
  ('000097', 'FONTCLARA COCH, POL', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Fiscal', 'Creado desde importación A3Nom 2024-10'),

  -- 02 DEPARTAMENTO CONTABLE (11 empleados - 000089 duplicado consolidado)
  ('000002', 'ARGUELLO PLANAS, JOSE MARIA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Creado desde importación A3Nom 2024-10'),
  ('000005', 'RODRIGUEZ MARTINEZ, MARIA ROSA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Creado desde importación A3Nom 2024-10'),
  ('000006', 'LEON LOPEZ, MARIA SIERRA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Creado desde importación A3Nom 2024-10'),
  ('000009', 'RAMIREZ RIVAS, ANITA ISABEL', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Creado desde importación A3Nom 2024-10'),
  ('000010', 'RICO HARO, JOSE', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Creado desde importación A3Nom 2024-10'),
  ('000016', 'PESCADOR ISAR, YOLANDA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Creado desde importación A3Nom 2024-10'),
  ('000086', 'LENKO, VASYL', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Creado desde importación A3Nom 2024-10'),
  ('000087', 'CARDENAS DACASA, PAULA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Creado desde importación A3Nom 2024-10'),
  ('000089', 'VARELA ARENAS, CLÀUDIA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Creado desde importación A3Nom 2024-10 - Doble nómina consolidada (495.83 + 70.83)'),
  ('005017', 'SANCHEZ PALACIOS, MARTINA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Creado desde importación A3Nom 2024-10'),
  ('005018', 'GARCIA PEÑA, JAUME', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Creado desde importación A3Nom 2024-10'),

  -- 03 DEPARTAMENTO LABORAL (15 empleados)
  ('000003', 'VIDUEIRA REAL, MAGDALENA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Creado desde importación A3Nom 2024-10'),
  ('000004', 'SALVO MARTINEZ, JOAN', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Creado desde importación A3Nom 2024-10'),
  ('000008', 'CASTRO MORALES, MONICA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Creado desde importación A3Nom 2024-10'),
  ('000012', 'MUÑOZ VEGA, ADRIAN', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Creado desde importación A3Nom 2024-10'),
  ('000017', 'VELARDE PORTILLO, IRENE', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Creado desde importación A3Nom 2024-10'),
  ('000021', 'MONTERO PORCEL, ADRIA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Creado desde importación A3Nom 2024-10'),
  ('000032', 'BORRELL LOPEZ, ESTELA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Creado desde importación A3Nom 2024-10'),
  ('000046', 'ABELLAN CALVO, ERIC', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Creado desde importación A3Nom 2024-10'),
  ('000047', 'RUBIO DELVALLE, RAÚL', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Creado desde importación A3Nom 2024-10'),
  ('000080', 'CHICA COCA, RAQUEL', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Creado desde importación A3Nom 2024-10'),
  ('000084', 'BROTONS BORRELL, ALEJANDRO', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Creado desde importación A3Nom 2024-10'),
  ('000090', 'LOPEZ TAMAYO, AITANA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Creado desde importación A3Nom 2024-10'),
  ('000091', 'MOLL MORILLAS, LAIA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Creado desde importación A3Nom 2024-10'),
  ('000093', 'AGUILERA TEJADA, YASMINA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Creado desde importación A3Nom 2024-10'),
  ('005016', 'FERNANDEZ CACERES, MIA LISBETH', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Creado desde importación A3Nom 2024-10'),

  -- 06 SERVICIOS AUXILIARES (6 empleados)
  ('000007', 'DIAZ MUÑOZ, ANTONIA MARIA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Servicios Auxiliares', 'Creado desde importación A3Nom 2024-10'),
  ('000094', 'LINARES PEREZ, LUCIA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Servicios Auxiliares', 'Creado desde importación A3Nom 2024-10'),
  ('000095', 'ZALACAIN GRANADOS, GEMMA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Servicios Auxiliares', 'Creado desde importación A3Nom 2024-10'),
  ('005007', 'SACCO MORICONI, CAROLINA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Servicios Auxiliares', 'Creado desde importación A3Nom 2024-10'),
  ('005014', 'SERRA VAL, ROC', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Servicios Auxiliares', 'Creado desde importación A3Nom 2024-10 - Posible becario (sin SS empresa)'),
  ('005019', 'SALVO NOGUERAS, BLANCA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Servicios Auxiliares', 'Creado desde importación A3Nom 2024-10'),

  -- 09 CALL CENTER MCD (2 empleados)
  ('000101', 'VIRTO SANZ, ALBA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Call Center', 'Creado desde importación A3Nom 2024-10'),
  ('000102', 'SANZ HERNANDEZ, SARA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Call Center', 'Creado desde importación A3Nom 2024-10'),

  -- 11 M&A (1 empleado)
  ('005015', 'IGLESIAS AYUSO, ORIOL', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'M&A', 'Creado desde importación A3Nom 2024-10')

ON CONFLICT (employee_code, company_id) DO NOTHING;

-- Verificaciones post-importación
-- Total empleados Navarro Empresarial (esperado: 42 = 6 antiguos + 36 nuevos)
SELECT 
  'Total empleados Navarro Empresarial' AS check_type,
  COUNT(*) AS count
FROM hr_employees 
WHERE company_id = '35ccb77c-90df-446e-a27a-d55891a6fd0a';

-- Empleados activos (esperado: 42)
SELECT 
  'Empleados activos (sin termination_date)' AS check_type,
  COUNT(*) AS count
FROM hr_employees 
WHERE company_id = '35ccb77c-90df-446e-a27a-d55891a6fd0a'
AND termination_date IS NULL;

-- Distribución por departamento
SELECT 
  COALESCE(department, 'Sin departamento') AS department,
  COUNT(*) AS count
FROM hr_employees 
WHERE company_id = '35ccb77c-90df-446e-a27a-d55891a6fd0a'
GROUP BY department
ORDER BY department;

-- Empleados nuevos del A3Nom (con notes específicos)
SELECT 
  'Empleados importados A3Nom 2024-10' AS check_type,
  COUNT(*) AS count
FROM hr_employees 
WHERE company_id = '35ccb77c-90df-446e-a27a-d55891a6fd0a'
AND notes LIKE '%Creado desde importación A3Nom 2024-10%';
