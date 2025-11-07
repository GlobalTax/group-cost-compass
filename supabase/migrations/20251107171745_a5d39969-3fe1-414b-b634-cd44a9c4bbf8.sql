-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view revenue_allocations of their org" ON public.revenue_allocations;
DROP POLICY IF EXISTS "Users can insert revenue_allocations to their org" ON public.revenue_allocations;
DROP POLICY IF EXISTS "Users can update revenue_allocations of their org" ON public.revenue_allocations;
DROP POLICY IF EXISTS "Users can delete revenue_allocations of their org" ON public.revenue_allocations;

-- Crear políticas RLS para revenue_allocations basadas en org_id

-- Política SELECT: Ver asignaciones de su organización
CREATE POLICY "Users can view revenue_allocations of their org"
  ON public.revenue_allocations
  FOR SELECT
  TO authenticated
  USING (org_id = public.get_current_user_org_id());

-- Política INSERT: Crear asignaciones en su organización
CREATE POLICY "Users can insert revenue_allocations to their org"
  ON public.revenue_allocations
  FOR INSERT
  TO authenticated
  WITH CHECK (org_id = public.get_current_user_org_id());

-- Política UPDATE: Actualizar asignaciones de su organización
CREATE POLICY "Users can update revenue_allocations of their org"
  ON public.revenue_allocations
  FOR UPDATE
  TO authenticated
  USING (org_id = public.get_current_user_org_id())
  WITH CHECK (org_id = public.get_current_user_org_id());

-- Política DELETE: Eliminar asignaciones de su organización
CREATE POLICY "Users can delete revenue_allocations of their org"
  ON public.revenue_allocations
  FOR DELETE
  TO authenticated
  USING (org_id = public.get_current_user_org_id());