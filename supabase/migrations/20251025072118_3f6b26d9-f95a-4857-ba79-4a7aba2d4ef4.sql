-- Tabla de empresas del grupo
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nif TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de empleados
CREATE TABLE public.hr_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  dni TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  hire_date DATE,
  termination_date DATE,
  seniority_date DATE,
  transfer_group BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de costes mensuales por empleado
CREATE TABLE public.hr_employee_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  period DATE NOT NULL, -- YYYY-MM-01
  bruto NUMERIC(12,2),
  coste_empresa NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de traslados interempresa
CREATE TABLE public.hr_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  from_company UUID REFERENCES public.companies(id),
  to_company UUID REFERENCES public.companies(id),
  transfer_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de auditoría
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID,
  action TEXT NOT NULL,
  user_id UUID,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vista consolidada de costes por empresa y año
CREATE OR REPLACE VIEW public.vw_costs_by_company_year AS
SELECT
  c.id as company_id,
  c.name as company,
  EXTRACT(YEAR FROM ec.period)::INTEGER as year,
  SUM(ec.bruto)::NUMERIC(14,2) as bruto_total,
  SUM(ec.coste_empresa)::NUMERIC(14,2) as coste_total,
  COUNT(DISTINCT ec.employee_id) as num_employees
FROM public.hr_employee_costs ec
JOIN public.hr_employees e ON e.id = ec.employee_id
JOIN public.companies c ON c.id = e.company_id
GROUP BY c.id, c.name, EXTRACT(YEAR FROM ec.period);

-- Índices para performance
CREATE INDEX idx_employee_costs_employee ON public.hr_employee_costs(employee_id);
CREATE INDEX idx_employee_costs_period ON public.hr_employee_costs(period);
CREATE INDEX idx_employees_company ON public.hr_employees(company_id);
CREATE INDEX idx_transfers_employee ON public.hr_transfers(employee_id);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hr_employees_updated_at BEFORE UPDATE ON public.hr_employees
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employee_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (todos los usuarios autenticados pueden leer/escribir por ahora)
CREATE POLICY "Allow all for authenticated users" ON public.companies
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON public.hr_employees
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON public.hr_employee_costs
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all for authenticated users" ON public.hr_transfers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read for authenticated users" ON public.audit_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Datos iniciales (seeds)
INSERT INTO public.companies (name, nif) VALUES
  ('Navarro Legal y Tributario, SLP', 'B67261552'),
  ('Beglobal Worldwide, SL', 'B09835315'),
  ('GoLooper, SL', 'B02721918'),
  ('SPV Corporate Advisor, SL', 'B09652017');