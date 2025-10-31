-- Crear tablas de presupuestos
CREATE TABLE public.budget_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period DATE NOT NULL,
  company_id UUID NULL REFERENCES public.companies(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('draft','approved','closed')) DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (period, company_id)
);

CREATE TABLE public.budget_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_period_id UUID NOT NULL REFERENCES public.budget_periods(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('billing','project','subsidy','other')),
  subcategory TEXT,
  description TEXT NOT NULL,
  budgeted_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  actual_amount NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.budget_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_period_id UUID NOT NULL REFERENCES public.budget_periods(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('operational','investment','other')),
  subcategory TEXT,
  description TEXT NOT NULL,
  budgeted_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  actual_amount NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para rendimiento
CREATE INDEX idx_budget_periods_period ON public.budget_periods(period);
CREATE INDEX idx_budget_periods_company ON public.budget_periods(company_id);
CREATE INDEX idx_budget_income_period ON public.budget_income(budget_period_id);
CREATE INDEX idx_budget_expenses_period ON public.budget_expenses(budget_period_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER trg_budget_periods_updated_at
BEFORE UPDATE ON public.budget_periods
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Habilitar RLS
ALTER TABLE public.budget_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_expenses ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para budget_periods
CREATE POLICY "budget_periods_select" ON public.budget_periods
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "budget_periods_insert" ON public.budget_periods
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "budget_periods_update" ON public.budget_periods
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "budget_periods_delete" ON public.budget_periods
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para budget_income
CREATE POLICY "budget_income_select" ON public.budget_income
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "budget_income_insert" ON public.budget_income
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "budget_income_update" ON public.budget_income
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "budget_income_delete" ON public.budget_income
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas RLS para budget_expenses
CREATE POLICY "budget_expenses_select" ON public.budget_expenses
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "budget_expenses_insert" ON public.budget_expenses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "budget_expenses_update" ON public.budget_expenses
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "budget_expenses_delete" ON public.budget_expenses
  FOR DELETE USING (auth.role() = 'authenticated');

-- Vista resumen de presupuestos (la que consulta el frontend)
CREATE OR REPLACE VIEW public.vw_budget_summary AS
SELECT
  bp.id,
  bp.period,
  bp.company_id,
  c.name AS company_name,
  bp.status,
  COALESCE(SUM(bi.budgeted_amount), 0) AS budgeted_income,
  COALESCE(SUM(bi.actual_amount), 0) AS actual_income,
  COALESCE(SUM(be.budgeted_amount), 0) AS total_budgeted_expenses,
  COALESCE(SUM(be.actual_amount), 0) AS total_actual_expenses,
  COALESCE(SUM(bi.budgeted_amount), 0) - COALESCE(SUM(be.budgeted_amount), 0) AS budgeted_result,
  COALESCE(SUM(bi.actual_amount), 0) - COALESCE(SUM(be.actual_amount), 0) AS actual_result
FROM public.budget_periods bp
LEFT JOIN public.companies c ON c.id = bp.company_id
LEFT JOIN public.budget_income bi ON bi.budget_period_id = bp.id
LEFT JOIN public.budget_expenses be ON be.budget_period_id = bp.id
GROUP BY bp.id, bp.period, bp.company_id, c.name, bp.status;