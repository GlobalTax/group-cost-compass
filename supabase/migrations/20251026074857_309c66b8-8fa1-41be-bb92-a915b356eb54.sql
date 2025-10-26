-- Add new organizational fields to hr_employees table
ALTER TABLE hr_employees
ADD COLUMN IF NOT EXISTS department TEXT,
ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'Laboral',
ADD COLUMN IF NOT EXISTS position TEXT;

-- Add comments for documentation
COMMENT ON COLUMN hr_employees.department IS 'Department where the employee works';
COMMENT ON COLUMN hr_employees.contract_type IS 'Type of employment contract (e.g., Laboral, Mercantil, etc.)';
COMMENT ON COLUMN hr_employees.position IS 'Job position or role of the employee';