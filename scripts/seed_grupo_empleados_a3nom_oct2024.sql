-- ============================================
-- SEED: Empleados Reales Grupo Navarro | Capittal
-- Fuente: Archivos A3Nom Octubre 2024
-- Total: 56 empleados distribuidos en 5 empresas
-- Fecha creación: 2025-11-01
-- ============================================

-- EMPRESA 1: Navarro Empresarial, SL (B58068800)
-- Company ID: 35ccb77c-90df-446e-a27a-d55891a6fd0a
-- Total: 36 empleados

INSERT INTO hr_employees (
  employee_code, full_name, company_id, org_id, hire_date, department, notes
) VALUES
  -- 01 DEPARTAMENTO FISCAL (1)
  ('000097', 'FONTCLARA COCH, POL', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Fiscal', 'Importado desde A3Nom 2024-10'),
  
  -- 02 DEPARTAMENTO CONTABLE (11)
  ('000002', 'ARGUELLO PLANAS, JOSE MARIA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Importado desde A3Nom 2024-10'),
  ('000005', 'RODRIGUEZ MARTINEZ, MARIA ROSA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Importado desde A3Nom 2024-10'),
  ('000006', 'LEON LOPEZ, MARIA SIERRA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Importado desde A3Nom 2024-10'),
  ('000009', 'RAMIREZ RIVAS, ANITA ISABEL', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Importado desde A3Nom 2024-10'),
  ('000010', 'RICO HARO, JOSE', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Importado desde A3Nom 2024-10'),
  ('000016', 'PESCADOR ISAR, YOLANDA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Importado desde A3Nom 2024-10'),
  ('000086', 'LENKO, VASYL', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Importado desde A3Nom 2024-10'),
  ('000087', 'CARDENAS DACASA, PAULA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Importado desde A3Nom 2024-10'),
  ('000089', 'VARELA ARENAS, CLÀUDIA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Importado desde A3Nom 2024-10. Doble nómina consolidada (495.83 + 70.83)'),
  ('005017', 'SANCHEZ PALACIOS, MARTINA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Importado desde A3Nom 2024-10'),
  ('005018', 'GARCIA PEÑA, JAUME', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Importado desde A3Nom 2024-10'),
  
  -- 03 DEPARTAMENTO LABORAL (15)
  ('000003', 'VIDUEIRA REAL, MAGDALENA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  ('000004', 'SALVO MARTINEZ, JOAN', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  ('000008', 'CASTRO MORALES, MONICA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  ('000012', 'MUÑOZ VEGA, ADRIAN', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  ('000017', 'VELARDE PORTILLO, IRENE', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  ('000021', 'MONTERO PORCEL, ADRIA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  ('000032', 'BORRELL LOPEZ, ESTELA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  ('000046', 'ABELLAN CALVO, ERIC', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  ('000047', 'RUBIO DELVALLE, RAÚL', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  ('000080', 'CHICA COCA, RAQUEL', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  ('000084', 'BROTONS BORRELL, ALEJANDRO', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  ('000090', 'LOPEZ TAMAYO, AITANA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  ('000091', 'MOLL MORILLAS, LAIA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  ('000093', 'AGUILERA TEJADA, YASMINA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  ('005016', 'FERNANDEZ CACERES, MIA LISBETH', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  
  -- 06 SERVICIOS AUXILIARES (6)
  ('000007', 'DIAZ MUÑOZ, ANTONIA MARIA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Servicios Auxiliares', 'Importado desde A3Nom 2024-10'),
  ('000094', 'LINARES PEREZ, LUCIA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Servicios Auxiliares', 'Importado desde A3Nom 2024-10'),
  ('000095', 'ZALACAIN GRANADOS, GEMMA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Servicios Auxiliares', 'Importado desde A3Nom 2024-10'),
  ('005007', 'SACCO MORICONI, CAROLINA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Servicios Auxiliares', 'Importado desde A3Nom 2024-10'),
  ('005014', 'SERRA VAL, ROC', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Servicios Auxiliares', 'Importado desde A3Nom 2024-10. Posible becario (sin SS empresa)'),
  ('005019', 'SALVO NOGUERAS, BLANCA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Servicios Auxiliares', 'Importado desde A3Nom 2024-10'),
  
  -- 09 CALL CENTER MCD (2)
  ('000101', 'VIRTO SANZ, ALBA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Call Center', 'Importado desde A3Nom 2024-10'),
  ('000102', 'SANZ HERNANDEZ, SARA', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Call Center', 'Importado desde A3Nom 2024-10'),
  
  -- 11 M&A (1)
  ('005015', 'IGLESIAS AYUSO, ORIOL', '35ccb77c-90df-446e-a27a-d55891a6fd0a', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'M&A', 'Importado desde A3Nom 2024-10'),

  -- EMPRESA 2: BeGlobal Worldwide, SL (B09835315)
  -- Company ID: 24d05806-971e-4287-b2bb-ad5617b3f824
  -- Total: 7 empleados
  ('000029', 'MORENO FORMENT, NIL', '24d05806-971e-4287-b2bb-ad5617b3f824', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Contable', 'Importado desde A3Nom 2024-10'),
  ('000018', 'GONZALEZ OLIVÉ, MARINA', '24d05806-971e-4287-b2bb-ad5617b3f824', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10. Solo coste SS empresa (1.068,99€), posible socia/administradora'),
  ('000032', 'BELLONCH BOTER, CLARA', '24d05806-971e-4287-b2bb-ad5617b3f824', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  ('000033', 'NEBOT GASPAR, JOAN', '24d05806-971e-4287-b2bb-ad5617b3f824', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Laboral', 'Importado desde A3Nom 2024-10'),
  ('000013', 'RASO OVEJERO, ANA ISABEL', '24d05806-971e-4287-b2bb-ad5617b3f824', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Servicios Auxiliares', 'Importado desde A3Nom 2024-10'),
  ('000020', 'VELASCO PEREZ, ROSMERI', '24d05806-971e-4287-b2bb-ad5617b3f824', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Servicios Auxiliares', 'Importado desde A3Nom 2024-10'),
  ('000034', 'ESTELLE CARCELLE, JULIA', '24d05806-971e-4287-b2bb-ad5617b3f824', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'M&A', 'Importado desde A3Nom 2024-10'),

  -- EMPRESA 3: GoLooper, SL (B02721918)
  -- Company ID: cb760402-f84d-43b0-9256-8fa79b9a9ea5
  -- Total: 6 empleados (sin departamento en A3Nom)
  ('000048', 'MAJORAL MARSAL, JORDI', 'cb760402-f84d-43b0-9256-8fa79b9a9ea5', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', NULL, 'Importado desde A3Nom 2024-10. Departamento pendiente de asignar'),
  ('000050', 'VALLS VIÑALS, PAU', 'cb760402-f84d-43b0-9256-8fa79b9a9ea5', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', NULL, 'Importado desde A3Nom 2024-10. Departamento pendiente de asignar'),
  ('000052', 'SANCHEZ PALACIOS, ADAM', 'cb760402-f84d-43b0-9256-8fa79b9a9ea5', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', NULL, 'Importado desde A3Nom 2024-10. Departamento pendiente de asignar'),
  ('000053', 'ASENSIO MARTINEZ, VICTOR', 'cb760402-f84d-43b0-9256-8fa79b9a9ea5', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', NULL, 'Importado desde A3Nom 2024-10. Departamento pendiente de asignar'),
  ('000055', 'SANCHEZ VILLARROEL, CINTHIA PATRICIA', 'cb760402-f84d-43b0-9256-8fa79b9a9ea5', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', NULL, 'Importado desde A3Nom 2024-10. Departamento pendiente de asignar. Nombre posiblemente acortado en nómina'),
  ('000051', 'MELENDEZ PEÑA, MIRIAN ZUYAPA', 'cb760402-f84d-43b0-9256-8fa79b9a9ea5', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', NULL, 'Importado desde A3Nom 2024-10. Departamento pendiente de asignar'),

  -- EMPRESA 4: Navarro Legal y Tributario, SLP (B67261552)
  -- Company ID: 1ae4a6a4-94cc-4074-9663-1026b91daf0f
  -- Total: 1 empleado
  ('000005', 'VICENTE SANCHEZ, ALBERTO', '1ae4a6a4-94cc-4074-9663-1026b91daf0f', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', 'Servicios Auxiliares', 'Importado desde A3Nom 2024-10'),

  -- EMPRESA 5: SPV Corporate Advisor, SL (B09652017)
  -- Company ID: d24b302c-dae7-4810-90c9-880a6da5ba17
  -- Total: 6 empleados (sin departamento en A3Nom)
  ('000001', 'MONTANYA RAIDO, LLUIS MIQUEL', 'd24b302c-dae7-4810-90c9-880a6da5ba17', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', NULL, 'Importado desde A3Nom 2024-10. Bruto = Coste empresa (1.600€), posible autónomo/administrador. Departamento pendiente de asignar'),
  ('000009', 'SERRA DE LA CRUZ, PAU', 'd24b302c-dae7-4810-90c9-880a6da5ba17', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', NULL, 'Importado desde A3Nom 2024-10. Departamento pendiente de asignar'),
  ('000011', 'TICO PUIGVERT, ALBERT', 'd24b302c-dae7-4810-90c9-880a6da5ba17', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', NULL, 'Importado desde A3Nom 2024-10. Departamento pendiente de asignar'),
  ('000013', 'RIFA GOMA-CAMPS, PAU', 'd24b302c-dae7-4810-90c9-880a6da5ba17', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', NULL, 'Importado desde A3Nom 2024-10. Departamento pendiente de asignar'),
  ('000014', 'TICO PUIGVERT, MARC', 'd24b302c-dae7-4810-90c9-880a6da5ba17', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', NULL, 'Importado desde A3Nom 2024-10. Departamento pendiente de asignar'),
  ('000015', 'CANET RIPOLL, MARC', 'd24b302c-dae7-4810-90c9-880a6da5ba17', '10af28dc-a9b8-4f0a-889e-4732e07df038', '2024-10-01', NULL, 'Importado desde A3Nom 2024-10. Departamento pendiente de asignar')

ON CONFLICT (employee_code, company_id) DO NOTHING;

-- ============================================
-- VERIFICACIONES POST-IMPORTACIÓN
-- ============================================

-- 1. Total general de empleados importados desde A3Nom
SELECT 
  'Total empleados importados desde A3Nom 2024-10' AS check_type,
  COUNT(*) AS count
FROM hr_employees
WHERE notes LIKE '%Importado desde A3Nom 2024-10%';

-- 2. Distribución por empresa
SELECT 
  c.name AS empresa,
  c.nif,
  COUNT(*) AS total_empleados
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.notes LIKE '%Importado desde A3Nom 2024-10%'
GROUP BY c.name, c.nif
ORDER BY c.name;

-- 3. Empleados con y sin departamento
SELECT 
  c.name AS empresa,
  COUNT(*) FILTER (WHERE e.department IS NOT NULL) AS con_departamento,
  COUNT(*) FILTER (WHERE e.department IS NULL) AS sin_departamento,
  COUNT(*) AS total
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.notes LIKE '%Importado desde A3Nom 2024-10%'
GROUP BY c.name
ORDER BY c.name;

-- 4. Casos especiales documentados
SELECT 
  c.name AS empresa,
  e.employee_code,
  e.full_name,
  e.department,
  e.notes
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.notes LIKE '%Importado desde A3Nom 2024-10%'
  AND (
    e.notes LIKE '%posible%'
    OR e.notes LIKE '%Doble%'
    OR e.notes LIKE '%Solo coste%'
    OR e.notes LIKE '%Bruto = Coste%'
  )
ORDER BY c.name, e.employee_code;

-- 5. Distribución por departamento en Navarro Empresarial
SELECT 
  COALESCE(department, 'Sin departamento') AS departamento,
  COUNT(*) AS cantidad
FROM hr_employees 
WHERE company_id = '35ccb77c-90df-446e-a27a-d55891a6fd0a'
  AND notes LIKE '%Importado desde A3Nom 2024-10%'
GROUP BY department
ORDER BY cantidad DESC;

-- 6. Verificación de empleados activos (sin fecha de baja)
SELECT 
  c.name AS empresa,
  COUNT(*) AS empleados_activos
FROM hr_employees e
JOIN companies c ON e.company_id = c.id
WHERE e.notes LIKE '%Importado desde A3Nom 2024-10%'
  AND e.termination_date IS NULL
GROUP BY c.name
ORDER BY c.name;

-- ============================================
-- RESUMEN ESPERADO:
-- ============================================
-- Total: 56 empleados
-- Navarro Empresarial, SL: 36 empleados (todos con departamento)
-- BeGlobal Worldwide, SL: 7 empleados (todos con departamento)
-- GoLooper, SL: 6 empleados (sin departamento)
-- Navarro Legal y Tributario, SLP: 1 empleado (con departamento)
-- SPV Corporate Advisor, SL: 6 empleados (sin departamento)
-- Casos especiales: 5 documentados en notes
-- ============================================
