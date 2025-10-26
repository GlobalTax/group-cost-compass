-- ==========================================
-- PASO 1: Crear funciones helper para RLS
-- ==========================================

-- Función para obtener org_id del usuario autenticado
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id 
  FROM public.users 
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- Función para verificar si un usuario tiene un rol específico
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = user_uuid 
    AND role = role_name
  )
  OR EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND role::text = role_name
  );
$$;

-- ==========================================
-- PASO 2: Añadir org_id a companies si no existe
-- ==========================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'companies' 
    AND column_name = 'org_id'
  ) THEN
    ALTER TABLE public.companies 
      ADD COLUMN org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
    
    -- Poblar con la primera organización disponible
    UPDATE public.companies 
    SET org_id = (SELECT id FROM public.organizations LIMIT 1)
    WHERE org_id IS NULL;
    
    -- Hacer NOT NULL si hay datos
    IF EXISTS (SELECT 1 FROM public.companies LIMIT 1) THEN
      ALTER TABLE public.companies ALTER COLUMN org_id SET NOT NULL;
    END IF;
    
    CREATE INDEX IF NOT EXISTS idx_companies_org_id ON public.companies(org_id);
  END IF;
END $$;

-- ==========================================
-- PASO 3: Añadir multi-tenancy a tablas HR
-- ==========================================

-- Añadir org_id a hr_employees
ALTER TABLE public.hr_employees 
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Añadir org_id a hr_employee_costs
ALTER TABLE public.hr_employee_costs 
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Añadir org_id a hr_transfers
ALTER TABLE public.hr_transfers 
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Poblar org_id desde companies o usar primera organización
UPDATE public.hr_employees e
SET org_id = COALESCE(
  (SELECT c.org_id FROM public.companies c WHERE c.id = e.company_id LIMIT 1),
  (SELECT id FROM public.organizations LIMIT 1)
)
WHERE e.org_id IS NULL;

UPDATE public.hr_employee_costs ec
SET org_id = COALESCE(
  (SELECT e.org_id FROM public.hr_employees e WHERE e.id = ec.employee_id LIMIT 1),
  (SELECT id FROM public.organizations LIMIT 1)
)
WHERE ec.org_id IS NULL;

UPDATE public.hr_transfers t
SET org_id = COALESCE(
  (SELECT e.org_id FROM public.hr_employees e WHERE e.id = t.employee_id LIMIT 1),
  (SELECT id FROM public.organizations LIMIT 1)
)
WHERE t.org_id IS NULL;

-- Hacer NOT NULL solo si hay datos
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.hr_employees LIMIT 1) THEN
    ALTER TABLE public.hr_employees ALTER COLUMN org_id SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM public.hr_employee_costs LIMIT 1) THEN
    ALTER TABLE public.hr_employee_costs ALTER COLUMN org_id SET NOT NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM public.hr_transfers LIMIT 1) THEN
    ALTER TABLE public.hr_transfers ALTER COLUMN org_id SET NOT NULL;
  END IF;
END $$;

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_hr_employees_org_id ON public.hr_employees(org_id);
CREATE INDEX IF NOT EXISTS idx_hr_costs_org_id ON public.hr_employee_costs(org_id);
CREATE INDEX IF NOT EXISTS idx_hr_transfers_org_id ON public.hr_transfers(org_id);

-- ==========================================
-- PASO 4: Eliminar políticas inseguras
-- ==========================================

DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.hr_employees;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.hr_employee_costs;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.hr_transfers;
DROP POLICY IF EXISTS hr_read_all ON public.hr_employees;
DROP POLICY IF EXISTS hr_insert_admin ON public.hr_employees;
DROP POLICY IF EXISTS hr_update_admin ON public.hr_employees;
DROP POLICY IF EXISTS costs_read_all ON public.hr_employee_costs;
DROP POLICY IF EXISTS costs_write_admin ON public.hr_employee_costs;
DROP POLICY IF EXISTS transfers_read_all ON public.hr_transfers;
DROP POLICY IF EXISTS transfers_write_admin ON public.hr_transfers;

-- ==========================================
-- PASO 5: Crear políticas RLS seguras
-- ==========================================

-- POLÍTICAS PARA hr_employees
CREATE POLICY "Users can view employees from their org"
ON public.hr_employees
FOR SELECT
TO authenticated
USING (org_id = public.get_user_org_id());

CREATE POLICY "Admins can create employees"
ON public.hr_employees
FOR INSERT
TO authenticated
WITH CHECK (
  org_id = public.get_user_org_id() 
  AND (
    public.has_role(auth.uid(), 'partner')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  )
);

CREATE POLICY "Admins can update employees"
ON public.hr_employees
FOR UPDATE
TO authenticated
USING (
  org_id = public.get_user_org_id() 
  AND (
    public.has_role(auth.uid(), 'partner')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  )
);

CREATE POLICY "Partners can delete employees"
ON public.hr_employees
FOR DELETE
TO authenticated
USING (
  org_id = public.get_user_org_id() 
  AND public.has_role(auth.uid(), 'partner')
);

-- POLÍTICAS PARA hr_employee_costs
CREATE POLICY "Users can view costs from their org"
ON public.hr_employee_costs
FOR SELECT
TO authenticated
USING (org_id = public.get_user_org_id());

CREATE POLICY "Finance can create costs"
ON public.hr_employee_costs
FOR INSERT
TO authenticated
WITH CHECK (
  org_id = public.get_user_org_id() 
  AND (
    public.has_role(auth.uid(), 'partner')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  )
);

CREATE POLICY "Finance can update costs"
ON public.hr_employee_costs
FOR UPDATE
TO authenticated
USING (
  org_id = public.get_user_org_id() 
  AND (
    public.has_role(auth.uid(), 'partner')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  )
);

CREATE POLICY "Partners can delete costs"
ON public.hr_employee_costs
FOR DELETE
TO authenticated
USING (
  org_id = public.get_user_org_id() 
  AND public.has_role(auth.uid(), 'partner')
);

-- POLÍTICAS PARA hr_transfers
CREATE POLICY "Users can view transfers from their org"
ON public.hr_transfers
FOR SELECT
TO authenticated
USING (org_id = public.get_user_org_id());

CREATE POLICY "Admins can create transfers"
ON public.hr_transfers
FOR INSERT
TO authenticated
WITH CHECK (
  org_id = public.get_user_org_id() 
  AND (
    public.has_role(auth.uid(), 'partner')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  )
);

CREATE POLICY "Admins can update transfers"
ON public.hr_transfers
FOR UPDATE
TO authenticated
USING (
  org_id = public.get_user_org_id() 
  AND (
    public.has_role(auth.uid(), 'partner')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'manager')
  )
);

CREATE POLICY "Partners can delete transfers"
ON public.hr_transfers
FOR DELETE
TO authenticated
USING (
  org_id = public.get_user_org_id() 
  AND public.has_role(auth.uid(), 'partner')
);

-- ==========================================
-- PASO 6: Recrear vistas con filtro org_id
-- ==========================================

DROP VIEW IF EXISTS public.vw_costs_by_company_year CASCADE;
DROP VIEW IF EXISTS public.vw_employee_annual CASCADE;
DROP VIEW IF EXISTS public.vw_transfers_summary CASCADE;

CREATE VIEW public.vw_costs_by_company_year AS
SELECT
  c.id as company_id,
  c.name as company,
  c.org_id,
  date_part('year', ec.period)::int as year,
  sum(ec.bruto)::numeric(14,2) as bruto_total,
  sum(ec.coste_empresa)::numeric(14,2) as coste_total
FROM public.hr_employee_costs ec
JOIN public.hr_employees e ON e.id = ec.employee_id
JOIN public.companies c ON c.id = e.company_id
GROUP BY 1,2,3,4;

CREATE VIEW public.vw_employee_annual AS
SELECT
  e.id as employee_id,
  e.full_name,
  e.org_id,
  c.id as company_id,
  c.name as company,
  date_part('year', ec.period)::int as year,
  sum(ec.bruto)::numeric(14,2) as bruto_anual,
  sum(ec.coste_empresa)::numeric(14,2) as coste_anual
FROM public.hr_employee_costs ec
JOIN public.hr_employees e ON e.id = ec.employee_id
JOIN public.companies c ON c.id = e.company_id
GROUP BY 1,2,3,4,5,6;

CREATE VIEW public.vw_transfers_summary AS
SELECT
  t.org_id,
  t.transfer_date,
  e.full_name,
  cf.name as from_company,
  ct.name as to_company,
  t.days_between,
  t.reason
FROM public.hr_transfers t
JOIN public.hr_employees e ON e.id = t.employee_id
JOIN public.companies cf ON cf.id = t.from_company
JOIN public.companies ct ON ct.id = t.to_company
ORDER BY t.transfer_date DESC;