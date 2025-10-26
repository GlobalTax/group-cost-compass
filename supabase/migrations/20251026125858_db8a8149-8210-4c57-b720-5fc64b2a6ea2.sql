-- Tabla para auditar cambios de roles
CREATE TABLE IF NOT EXISTS public.user_roles_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('assigned', 'revoked')),
  performed_by UUID REFERENCES auth.users(id),
  org_id UUID REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_user_roles_audit_user ON user_roles_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_audit_performed_by ON user_roles_audit(performed_by);
CREATE INDEX IF NOT EXISTS idx_user_roles_audit_created_at ON user_roles_audit(created_at DESC);

-- RLS: Solo super admins pueden ver auditoría
ALTER TABLE user_roles_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view audit"
ON user_roles_audit FOR SELECT
TO authenticated
USING (is_super_admin(auth.uid()));

-- Trigger para registrar automáticamente cambios en user_roles
CREATE OR REPLACE FUNCTION log_user_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO user_roles_audit (user_id, role, action, performed_by, org_id)
    VALUES (NEW.user_id, NEW.role, 'assigned', auth.uid(), NEW.org_id);
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO user_roles_audit (user_id, role, action, performed_by, org_id)
    VALUES (OLD.user_id, OLD.role, 'revoked', auth.uid(), OLD.org_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_log_user_role_changes
AFTER INSERT OR DELETE ON user_roles
FOR EACH ROW
EXECUTE FUNCTION log_user_role_changes();