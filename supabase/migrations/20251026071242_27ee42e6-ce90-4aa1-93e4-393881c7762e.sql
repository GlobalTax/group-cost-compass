-- Drop existing views first to avoid conflicts
DROP VIEW IF EXISTS public.vw_costs_by_company_year CASCADE;
DROP VIEW IF EXISTS public.vw_employee_annual CASCADE;
DROP VIEW IF EXISTS public.vw_transfers_summary CASCADE;

-- Add missing fields to companies
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
  ALTER TABLE public.companies ADD CONSTRAINT companies_nif_unique UNIQUE (nif);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Add missing fields to hr_employees
ALTER TABLE public.hr_employees
ADD COLUMN IF NOT EXISTS employee_code TEXT,
ADD COLUMN IF NOT EXISTS nss TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
  ALTER TABLE public.hr_employees ADD CONSTRAINT hr_employees_employee_code_unique UNIQUE (employee_code);
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Add unique constraint to hr_employee_costs
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'hr_employee_costs_employee_id_period_unique'
  ) THEN
    ALTER TABLE public.hr_employee_costs
    ADD CONSTRAINT hr_employee_costs_employee_id_period_unique UNIQUE (employee_id, period);
  END IF;
END $$;

-- Recreate hr_transfers with correct structure
DROP TABLE IF EXISTS public.hr_transfers CASCADE;

CREATE TABLE public.hr_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  from_company UUID REFERENCES public.companies(id),
  to_company UUID REFERENCES public.companies(id),
  transfer_date DATE NOT NULL,
  days_between INTEGER,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_costs_employee ON public.hr_employee_costs(employee_id);
CREATE INDEX IF NOT EXISTS idx_costs_period ON public.hr_employee_costs(period);
CREATE INDEX IF NOT EXISTS idx_transfers_employee ON public.hr_transfers(employee_id);

-- Create aggregation views with correct structure
CREATE VIEW public.vw_costs_by_company_year AS
SELECT
  c.name AS company,
  c.id AS company_id,
  DATE_PART('year', ec.period)::INT AS year,
  SUM(ec.bruto)::NUMERIC(14,2) AS bruto_total,
  SUM(ec.coste_empresa)::NUMERIC(14,2) AS coste_total,
  COUNT(DISTINCT ec.employee_id) AS employee_count
FROM public.hr_employee_costs ec
JOIN public.hr_employees e ON e.id = ec.employee_id
JOIN public.companies c ON c.id = e.company_id
GROUP BY c.name, c.id, DATE_PART('year', ec.period);

CREATE VIEW public.vw_employee_annual AS
SELECT
  e.id AS employee_id,
  e.full_name,
  e.employee_code,
  c.name AS company,
  c.id AS company_id,
  DATE_PART('year', ec.period)::INT AS year,
  SUM(ec.bruto)::NUMERIC(14,2) AS bruto_anual,
  SUM(ec.coste_empresa)::NUMERIC(14,2) AS coste_anual,
  COUNT(ec.id) AS months_worked
FROM public.hr_employee_costs ec
JOIN public.hr_employees e ON e.id = ec.employee_id
JOIN public.companies c ON c.id = e.company_id
GROUP BY e.id, e.full_name, e.employee_code, c.name, c.id, DATE_PART('year', ec.period);

CREATE VIEW public.vw_transfers_summary AS
SELECT
  e.full_name AS employee_name,
  e.dni,
  c_from.name AS from_company,
  c_to.name AS to_company,
  t.transfer_date,
  t.days_between,
  t.reason
FROM public.hr_transfers t
JOIN public.hr_employees e ON e.id = t.employee_id
LEFT JOIN public.companies c_from ON c_from.id = t.from_company
LEFT JOIN public.companies c_to ON c_to.id = t.to_company
ORDER BY t.transfer_date DESC;