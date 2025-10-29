-- Añadir columna para tipo de contrato en empleados
ALTER TABLE hr_employees 
ADD COLUMN IF NOT EXISTS contract_type TEXT;

-- Crear índice para búsquedas rápidas por DNI
CREATE INDEX IF NOT EXISTS idx_employees_dni ON hr_employees(dni);

-- Comentarios para documentación
COMMENT ON COLUMN hr_employees.contract_type IS 'Tipo de contrato laboral (ej: 100 – Indefinido Tiempo Completo, 421 – Para la Formación)';
COMMENT ON INDEX idx_employees_dni IS 'Índice para acelerar búsquedas y agrupaciones por DNI en detección de traslados';