-- Habilitar RLS en todas las tablas públicas
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employee_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_transfers ENABLE ROW LEVEL SECURITY;