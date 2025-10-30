-- Crear tabla job_postings
CREATE TABLE IF NOT EXISTS public.job_postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  title VARCHAR(200) NOT NULL,
  department VARCHAR(100),
  location VARCHAR(200),
  remote_work_allowed BOOLEAN DEFAULT false,
  employment_type VARCHAR(50), -- full-time, part-time, contract, internship
  position_level VARCHAR(50), -- junior, mid, senior, lead
  description TEXT,
  responsibilities JSONB DEFAULT '[]'::jsonb,
  requirements JSONB DEFAULT '{}'::jsonb,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency VARCHAR(3) DEFAULT 'EUR',
  benefits JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, closed
  published_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  target_start_date DATE,
  hiring_manager_id UUID REFERENCES auth.users(id),
  recruiter_id UUID REFERENCES auth.users(id),
  vacancies_count INTEGER DEFAULT 1,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Añadir campo job_posting_id a recruitment_processes
ALTER TABLE public.recruitment_processes 
ADD COLUMN IF NOT EXISTS job_posting_id UUID REFERENCES public.job_postings(id);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_job_postings_org_id ON public.job_postings(org_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON public.job_postings(status);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_org_id ON public.candidates(org_id);
CREATE INDEX IF NOT EXISTS idx_recruitment_processes_status ON public.recruitment_processes(status);
CREATE INDEX IF NOT EXISTS idx_recruitment_processes_stage ON public.recruitment_processes(current_stage);
CREATE INDEX IF NOT EXISTS idx_recruitment_processes_job_posting ON public.recruitment_processes(job_posting_id);

-- Enable RLS
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- RLS Policies para job_postings
CREATE POLICY "Users can view job_postings from their org"
  ON public.job_postings FOR SELECT
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can create job_postings in their org"
  ON public.job_postings FOR INSERT
  WITH CHECK (org_id = get_user_org_id() AND created_by = auth.uid());

CREATE POLICY "Users can update job_postings in their org"
  ON public.job_postings FOR UPDATE
  USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete job_postings in their org"
  ON public.job_postings FOR DELETE
  USING (org_id = get_user_org_id());

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_job_postings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION update_job_postings_updated_at();