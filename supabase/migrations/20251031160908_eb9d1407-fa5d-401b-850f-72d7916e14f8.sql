-- Añadir columna department a compensation_bands
ALTER TABLE compensation_bands 
ADD COLUMN IF NOT EXISTS department TEXT;

-- Crear índice para mejorar queries por departamento
CREATE INDEX IF NOT EXISTS idx_compensation_bands_department_level 
ON compensation_bands(department, level) 
WHERE is_active = true;

-- Migrar datos existentes a departamento 'M&A' (asumiendo que son de M&A)
UPDATE compensation_bands 
SET department = 'M&A' 
WHERE department IS NULL;

-- Hacer campo obligatorio después de migración
ALTER TABLE compensation_bands 
ALTER COLUMN department SET NOT NULL;

-- Comentario de la columna
COMMENT ON COLUMN compensation_bands.department IS 
'Departamento al que aplica la banda salarial (M&A, Ventas, Operaciones, Tech, Finanzas, RRHH, Marketing, etc.)';