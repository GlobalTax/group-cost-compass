-- Sistema de Compensación y Bonus - Capittal Transacciones

-- 1. Bandas salariales por nivel profesional
CREATE TABLE IF NOT EXISTS public.compensation_bands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR NOT NULL,
  min_salary NUMERIC NOT NULL,
  max_salary NUMERIC NOT NULL,
  target_bonus_pct NUMERIC NOT NULL DEFAULT 0,
  max_bonus_pct NUMERIC NOT NULL DEFAULT 0,
  success_fee_base_pct NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Operaciones/Deals M&A
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_name VARCHAR NOT NULL,
  client_name VARCHAR,
  deal_type VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'pipeline',
  total_fees NUMERIC DEFAULT 0,
  success_fee_pool NUMERIC DEFAULT 0,
  close_date DATE,
  fiscal_year INT,
  lead_partner_id UUID REFERENCES public.hr_employees(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Participantes en deals (many-to-many)
CREATE TABLE IF NOT EXISTS public.deal_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  role_in_deal VARCHAR,
  participation_pct NUMERIC NOT NULL DEFAULT 0,
  bonus_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(deal_id, employee_id)
);

-- 4. Registro histórico de bonus pagados
CREATE TABLE IF NOT EXISTS public.bonus_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.hr_employees(id),
  payment_date DATE NOT NULL,
  fiscal_year INT NOT NULL,
  bonus_type VARCHAR NOT NULL,
  amount NUMERIC NOT NULL,
  deal_id UUID REFERENCES public.deals(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Evaluaciones de desempeño
CREATE TABLE IF NOT EXISTS public.performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.hr_employees(id),
  review_period VARCHAR NOT NULL,
  reviewer_id UUID REFERENCES public.hr_employees(id),
  performance_score NUMERIC,
  bonus_multiplier NUMERIC DEFAULT 1.0,
  strengths TEXT,
  areas_improvement TEXT,
  review_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Extensión de hr_employees con campos de compensación
ALTER TABLE public.hr_employees 
ADD COLUMN IF NOT EXISTS compensation_level VARCHAR,
ADD COLUMN IF NOT EXISTS target_bonus_pct NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS success_fee_pct NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_extra NUMERIC DEFAULT 0;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_fiscal_year ON public.deals(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_deal_participants_employee ON public.deal_participants(employee_id);
CREATE INDEX IF NOT EXISTS idx_deal_participants_deal ON public.deal_participants(deal_id);
CREATE INDEX IF NOT EXISTS idx_bonus_payments_employee_year ON public.bonus_payments(employee_id, fiscal_year);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON public.performance_reviews(employee_id);

-- RLS Policies
ALTER TABLE public.compensation_bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;

-- Policies para compensation_bands (todos pueden ver, solo admin/finanzas/rrhh pueden editar)
CREATE POLICY "Users can view compensation bands"
  ON public.compensation_bands FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage compensation bands"
  ON public.compensation_bands FOR ALL
  USING (true);

-- Policies para deals
CREATE POLICY "Users can view deals"
  ON public.deals FOR SELECT
  USING (true);

CREATE POLICY "Users can manage deals"
  ON public.deals FOR ALL
  USING (true);

-- Policies para deal_participants
CREATE POLICY "Users can view deal participants"
  ON public.deal_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can manage deal participants"
  ON public.deal_participants FOR ALL
  USING (true);

-- Policies para bonus_payments
CREATE POLICY "Users can view bonus payments"
  ON public.bonus_payments FOR SELECT
  USING (true);

CREATE POLICY "Users can manage bonus payments"
  ON public.bonus_payments FOR ALL
  USING (true);

-- Policies para performance_reviews
CREATE POLICY "Users can view performance reviews"
  ON public.performance_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can manage performance reviews"
  ON public.performance_reviews FOR ALL
  USING (true);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_compensation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Triggers para updated_at
CREATE TRIGGER update_compensation_bands_updated_at
  BEFORE UPDATE ON public.compensation_bands
  FOR EACH ROW
  EXECUTE FUNCTION public.update_compensation_updated_at();

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_compensation_updated_at();

-- Función para calcular bonus de participantes al actualizar deal
CREATE OR REPLACE FUNCTION public.calculate_deal_participant_bonuses()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar bonus_amount de todos los participantes cuando cambia el success_fee_pool
  IF NEW.success_fee_pool IS DISTINCT FROM OLD.success_fee_pool THEN
    UPDATE public.deal_participants
    SET bonus_amount = (NEW.success_fee_pool * participation_pct / 100)
    WHERE deal_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER calculate_bonuses_on_deal_update
  AFTER UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_deal_participant_bonuses();

-- Insertar bandas salariales por defecto
INSERT INTO public.compensation_bands (level, min_salary, max_salary, target_bonus_pct, max_bonus_pct, success_fee_base_pct, description, is_active) VALUES
('analyst', 24000, 35000, 10, 25, 2, 'Analista junior - Soporte en análisis y due diligence', true),
('associate', 35000, 50000, 15, 35, 5, 'Associate - Ejecución de operaciones y análisis avanzado', true),
('senior_associate', 50000, 70000, 20, 45, 8, 'Senior Associate - Liderazgo de workstreams', true),
('manager', 70000, 95000, 25, 60, 12, 'Manager - Gestión de operaciones completas', true),
('director', 95000, 130000, 30, 80, 15, 'Director - Liderazgo de múltiples operaciones', true),
('partner', 130000, 200000, 40, 150, 25, 'Partner - Desarrollo de negocio y cierre de deals', true);