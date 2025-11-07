-- Tabla principal de ingresos (revenue_items)
CREATE TABLE public.revenue_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  period DATE NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT,
  total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  client_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de asignaciones de ingresos (revenue_allocations)
CREATE TABLE public.revenue_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  revenue_item_id UUID NOT NULL REFERENCES public.revenue_items(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  allocated_amount DECIMAL(12,2),
  allocation_percentage DECIMAL(5,2) CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
  allocation_type TEXT CHECK (allocation_type IN ('originator', 'executor', 'support')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT employee_or_team_required CHECK (employee_id IS NOT NULL OR team_id IS NOT NULL),
  CONSTRAINT amount_or_percentage_required CHECK (allocated_amount IS NOT NULL OR allocation_percentage IS NOT NULL)
);

-- Índices para optimizar consultas
CREATE INDEX idx_revenue_items_company ON public.revenue_items(company_id);
CREATE INDEX idx_revenue_items_period ON public.revenue_items(period);
CREATE INDEX idx_revenue_items_org ON public.revenue_items(org_id);
CREATE INDEX idx_revenue_allocations_revenue ON public.revenue_allocations(revenue_item_id);
CREATE INDEX idx_revenue_allocations_employee ON public.revenue_allocations(employee_id);
CREATE INDEX idx_revenue_allocations_team ON public.revenue_allocations(team_id);
CREATE INDEX idx_revenue_allocations_org ON public.revenue_allocations(org_id);

-- Trigger para updated_at en revenue_items
CREATE TRIGGER update_revenue_items_updated_at
  BEFORE UPDATE ON public.revenue_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS policies para revenue_items
ALTER TABLE public.revenue_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view revenue_items of their org"
  ON public.revenue_items FOR SELECT
  USING (org_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can insert revenue_items to their org"
  ON public.revenue_items FOR INSERT
  WITH CHECK (org_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can update revenue_items of their org"
  ON public.revenue_items FOR UPDATE
  USING (org_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can delete revenue_items of their org"
  ON public.revenue_items FOR DELETE
  USING (org_id = '00000000-0000-0000-0000-000000000000'::uuid);

-- RLS policies para revenue_allocations
ALTER TABLE public.revenue_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view revenue_allocations of their org"
  ON public.revenue_allocations FOR SELECT
  USING (org_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can insert revenue_allocations to their org"
  ON public.revenue_allocations FOR INSERT
  WITH CHECK (org_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can update revenue_allocations of their org"
  ON public.revenue_allocations FOR UPDATE
  USING (org_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users can delete revenue_allocations of their org"
  ON public.revenue_allocations FOR DELETE
  USING (org_id = '00000000-0000-0000-0000-000000000000'::uuid);