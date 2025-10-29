-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.hr_employees;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.hr_employee_costs;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.hr_transfers;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.companies;
DROP POLICY IF EXISTS "dev_anon_read_companies" ON public.companies;

-- =====================================================
-- HR_EMPLOYEES: Políticas granulares
-- =====================================================

CREATE POLICY "authenticated_select_employees" 
ON public.hr_employees
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_insert_employees"
ON public.hr_employees
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_update_employees"
ON public.hr_employees
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_delete_employees"
ON public.hr_employees
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- HR_EMPLOYEE_COSTS: Políticas granulares
-- =====================================================

CREATE POLICY "authenticated_select_costs" 
ON public.hr_employee_costs
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_insert_costs"
ON public.hr_employee_costs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_update_costs"
ON public.hr_employee_costs
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_delete_costs"
ON public.hr_employee_costs
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- HR_TRANSFERS: Políticas granulares
-- =====================================================

CREATE POLICY "authenticated_select_transfers" 
ON public.hr_transfers
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_insert_transfers"
ON public.hr_transfers
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_update_transfers"
ON public.hr_transfers
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_delete_transfers"
ON public.hr_transfers
FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- COMPANIES: Políticas granulares
-- =====================================================

CREATE POLICY "authenticated_select_companies" 
ON public.companies
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_insert_companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "authenticated_update_companies"
ON public.companies
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "authenticated_delete_companies"
ON public.companies
FOR DELETE
TO authenticated
USING (true);