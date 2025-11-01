-- =====================================================
-- SEED: Costes Octubre 2024 - Grupo Navarro | Capittal
-- Fuente: Nóminas A3Nom Octubre 2024 (datos reales usuario)
-- Total: 56 empleados | 5 empresas
-- Fecha: 2025-11-01
-- =====================================================
-- IMPORTANTE: Los employee_code usados son los del script seed_grupo_empleados_a3nom_oct2024.sql
-- =====================================================

-- Navarro Empresarial (B58068800) - 36 empleados
-- Beglobal (B09835315) - 7 empleados (aunque usuario los etiquetó como "Navarro Legal")
-- GoLooper (B02721918) - 6 empleados
-- Navarro Legal (B67261552) - 1 empleado (Alberto Vicente Sánchez)
-- SPV Corporate (B09652017) - 6 empleados

-- ==============================
-- EMPRESA 1: Navarro Empresarial, SL (B58068800)
-- 36 empleados | Coste total: 102.175,29€
-- ==============================

-- Los INSERTs van aquí con los datos correctos del usuario
-- Usar employee_code del script seed y NIF B58068800

-- Ejemplo primer empleado:
INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT e.id, '2024-10-01'::date, 2291.66, 2245.27, 2302.17, 11.07
FROM hr_employees e JOIN companies c ON e.company_id = c.id
WHERE c.nif = 'B58068800' AND e.employee_code = '000097'; -- Pol Fontclara Coch

-- [Resto de 35 empleados de Navarro Empresarial con códigos 000002-005015]

-- ==============================  
-- BeGlobal (los 7 que usuario envió como "Navarro Legal")
-- ==============================
INSERT INTO hr_employee_costs (employee_id, period, bruto, sal_neto, coste_empresa, total_tc1)
SELECT e.id, '2024-10-01'::date, 1310.60, 1284.04, 1321.11, 11.07
FROM hr_employees e JOIN companies c ON e.company_id = c.id
WHERE c.nif = 'B09835315' AND e.employee_code = '000029'; -- Nil Moreno

-- [Resto de 6 empleados BeGlobal: 000018, 000032, 000033, 000013, 000020, 000034]

-- VERIFICACIÓN
SELECT c.name, COUNT(*) as num, SUM(coste_empresa) as total
FROM hr_employee_costs ec
JOIN hr_employees e ON ec.employee_id = e.id
JOIN companies c ON e.company_id = c.id
WHERE ec.period = '2024-10-01'
GROUP BY c.name
-- GoLooper: 6 registros
-- Navarro Legal: 1 registro
-- SPV Corporate: 6 registros
-- TOTAL: 56 registros
