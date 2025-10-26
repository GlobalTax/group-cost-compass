-- DEV ONLY: Allow anonymous read access to key tables
-- These policies enable viewing employees and related data without authentication
-- In production, these should be restricted to authenticated users with proper org_id checks

CREATE POLICY "dev_anon_read_companies"
  ON public.companies
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "dev_anon_read_employees"
  ON public.hr_employees
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "dev_anon_read_costs"
  ON public.hr_employee_costs
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "dev_anon_read_transfers"
  ON public.hr_transfers
  FOR SELECT
  TO anon
  USING (true);