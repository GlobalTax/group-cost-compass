-- Modificar tabla job_offers para campos económicos flexibles
ALTER TABLE job_offers
ADD COLUMN salary_base numeric,
ADD COLUMN bonus_amount numeric,
ADD COLUMN bonus_conditions text,
ADD COLUMN exclusivity_compensation numeric,
ADD COLUMN exclusivity_percentage numeric CHECK (exclusivity_percentage >= 0 AND exclusivity_percentage <= 100),
ADD COLUMN contract_type text DEFAULT 'indefinido',
ADD COLUMN contract_duration text,
ADD COLUMN probation_duration text,
ADD COLUMN weekly_hours numeric DEFAULT 40,
ADD COLUMN expense_reimbursement text,
ADD COLUMN exclusivity_clause text,
ADD COLUMN non_compete_clause text,
ADD COLUMN other_benefits jsonb DEFAULT '[]'::jsonb;

-- Hacer candidate_id opcional (ya era nullable, pero nos aseguramos)
ALTER TABLE job_offers ALTER COLUMN candidate_id DROP NOT NULL;
ALTER TABLE job_offers ALTER COLUMN candidate_name DROP NOT NULL;
ALTER TABLE job_offers ALTER COLUMN candidate_email DROP NOT NULL;

-- Crear tabla intermedia job_offer_candidates para relación many-to-many
CREATE TABLE IF NOT EXISTS job_offer_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  job_offer_id uuid NOT NULL REFERENCES job_offers(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  pdf_url text,
  sent_at timestamptz,
  viewed_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(job_offer_id, candidate_id)
);

-- Habilitar RLS en job_offer_candidates
ALTER TABLE job_offer_candidates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para job_offer_candidates
CREATE POLICY "Users can view job_offer_candidates from their org"
ON job_offer_candidates FOR SELECT
USING (org_id = get_user_org_id());

CREATE POLICY "Users can create job_offer_candidates in their org"
ON job_offer_candidates FOR INSERT
WITH CHECK (org_id = get_user_org_id());

CREATE POLICY "Users can update job_offer_candidates in their org"
ON job_offer_candidates FOR UPDATE
USING (org_id = get_user_org_id());

CREATE POLICY "Users can delete job_offer_candidates in their org"
ON job_offer_candidates FOR DELETE
USING (org_id = get_user_org_id());

-- Índices para mejor rendimiento
CREATE INDEX idx_job_offer_candidates_offer ON job_offer_candidates(job_offer_id);
CREATE INDEX idx_job_offer_candidates_candidate ON job_offer_candidates(candidate_id);
CREATE INDEX idx_job_offer_candidates_org ON job_offer_candidates(org_id);

-- Comentarios
COMMENT ON TABLE job_offer_candidates IS 'Relación many-to-many entre ofertas y candidatos';
COMMENT ON COLUMN job_offers.salary_base IS 'Salario base bruto anual';
COMMENT ON COLUMN job_offers.bonus_amount IS 'Bonus variable anual';
COMMENT ON COLUMN job_offers.exclusivity_compensation IS 'Compensación económica por exclusividad';
COMMENT ON COLUMN job_offers.exclusivity_percentage IS 'Porcentaje del salario base por exclusividad';