-- Remove global unique constraint on employee_code
ALTER TABLE hr_employees DROP CONSTRAINT IF EXISTS hr_employees_employee_code_unique;

-- Create composite unique constraint on (company_id, employee_code)
-- This allows the same employee_code to exist across different companies
CREATE UNIQUE INDEX IF NOT EXISTS hr_emp_company_code_unique 
ON hr_employees(company_id, employee_code);

-- Ensure index on employee_code for faster lookups
CREATE INDEX IF NOT EXISTS idx_hr_employees_employee_code 
ON hr_employees(employee_code);