-- Tabla maestra para templates de asignación
CREATE TABLE public.revenue_allocation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_allocation_templates_org ON public.revenue_allocation_templates(org_id);

ALTER TABLE public.revenue_allocation_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view templates of their org"
  ON public.revenue_allocation_templates FOR SELECT
  USING (org_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can insert templates to their org"
  ON public.revenue_allocation_templates FOR INSERT
  WITH CHECK (org_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can update templates of their org"
  ON public.revenue_allocation_templates FOR UPDATE
  USING (org_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can delete templates of their org"
  ON public.revenue_allocation_templates FOR DELETE
  USING (org_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE TRIGGER update_allocation_templates_updated_at
  BEFORE UPDATE ON public.revenue_allocation_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Tabla de líneas de template (asignaciones del patrón)
CREATE TABLE public.revenue_allocation_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  template_id UUID NOT NULL REFERENCES public.revenue_allocation_templates(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  allocation_percentage DECIMAL(5,2) NOT NULL CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  allocation_type TEXT CHECK (allocation_type IN ('originator', 'executor', 'support')),
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT template_employee_or_team_required CHECK (employee_id IS NOT NULL OR team_id IS NOT NULL)
);

CREATE INDEX idx_template_items_template ON public.revenue_allocation_template_items(template_id);
CREATE INDEX idx_template_items_org ON public.revenue_allocation_template_items(org_id);

ALTER TABLE public.revenue_allocation_template_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view template items of their org"
  ON public.revenue_allocation_template_items FOR SELECT
  USING (org_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can insert template items to their org"
  ON public.revenue_allocation_template_items FOR INSERT
  WITH CHECK (org_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can update template items of their org"
  ON public.revenue_allocation_template_items FOR UPDATE
  USING (org_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can delete template items of their org"
  ON public.revenue_allocation_template_items FOR DELETE
  USING (org_id = '00000000-0000-0000-0000-000000000000'::uuid);