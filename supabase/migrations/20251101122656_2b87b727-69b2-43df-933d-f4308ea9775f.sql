-- Corregir políticas RLS en audit_logs para permitir INSERT de usuarios autenticados

-- 1. Habilitar RLS si no está habilitado
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas conflictivas
DROP POLICY IF EXISTS "Users can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Admin users can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Allow authenticated users to insert audit logs" ON audit_logs;

-- 3. Política INSERT: permitir a usuarios autenticados insertar sus propios logs
CREATE POLICY "Allow authenticated users to insert audit logs"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

-- 4. Política SELECT: permitir a admin/super_admin leer logs
CREATE POLICY "Admin users can view audit logs"
ON audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
);