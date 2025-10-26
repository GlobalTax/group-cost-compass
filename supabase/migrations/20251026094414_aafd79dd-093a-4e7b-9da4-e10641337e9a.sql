-- Add missing fields to hr_employees table
ALTER TABLE hr_employees
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Add comment for documentation
COMMENT ON COLUMN hr_employees.birth_date IS 'Employee date of birth';
COMMENT ON COLUMN hr_employees.address IS 'Employee residential address';