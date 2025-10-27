-- Fase 1: Ampliar tabla companies con campos adicionales
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS founded_date DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Fase 2: Crear tabla role_configurations
CREATE TABLE IF NOT EXISTS role_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT UNIQUE NOT NULL,
  display_name VARCHAR NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insertar configuraciones iniciales de roles
INSERT INTO role_configurations (role, display_name, description, permissions) VALUES
('super_admin', 'Super Administrador', 'Acceso total al sistema incluyendo configuración y gestión de usuarios', '{"all": true}'::jsonb),
('admin', 'Administrador', 'Gestión de empleados, costes y datos de RRHH', '{"employees": true, "costs": true, "companies": true}'::jsonb),
('manager', 'Manager', 'Visualización y gestión de equipos asignados', '{"employees": "read", "costs": "read", "reports": true}'::jsonb),
('senior', 'Senior', 'Acceso a datos de su área y reportes', '{"employees": "read", "costs": "read"}'::jsonb),
('junior', 'Junior', 'Acceso limitado de lectura', '{"employees": "read"}'::jsonb),
('finance', 'Finanzas', 'Acceso completo a dashboards y reportes financieros', '{"dashboard": true, "costs": "read", "reports": true}'::jsonb)
ON CONFLICT (role) DO NOTHING;

-- Fase 3: Crear tabla system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  setting_key VARCHAR NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  setting_category VARCHAR DEFAULT 'general',
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(org_id, setting_key)
);

-- Insertar configuraciones por defecto
INSERT INTO system_settings (org_id, setting_key, setting_value, description, setting_category)
SELECT 
  org_id,
  'organization_name',
  '{"value": "Grupo Navarro"}'::jsonb,
  'Nombre de la organización',
  'general'
FROM companies
WHERE org_id IS NOT NULL
GROUP BY org_id
ON CONFLICT DO NOTHING;

INSERT INTO system_settings (org_id, setting_key, setting_value, description, setting_category)
SELECT 
  org_id,
  'fiscal_year_start',
  '{"value": "01-01"}'::jsonb,
  'Inicio del año fiscal (MM-DD)',
  'financial'
FROM companies
WHERE org_id IS NOT NULL
GROUP BY org_id
ON CONFLICT DO NOTHING;

INSERT INTO system_settings (org_id, setting_key, setting_value, description, setting_category)
SELECT 
  org_id,
  'currency',
  '{"value": "EUR"}'::jsonb,
  'Moneda por defecto',
  'financial'
FROM companies
WHERE org_id IS NOT NULL
GROUP BY org_id
ON CONFLICT DO NOTHING;

-- RLS Policies para role_configurations
ALTER TABLE role_configurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can manage role configurations"
ON role_configurations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

CREATE POLICY "All authenticated users can view role configurations"
ON role_configurations FOR SELECT
USING (auth.role() = 'authenticated');

-- RLS Policies para system_settings
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can manage system settings"
ON system_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  )
);

CREATE POLICY "All authenticated users can view system settings"
ON system_settings FOR SELECT
USING (auth.role() = 'authenticated');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para role_configurations
DROP TRIGGER IF EXISTS update_role_configurations_updated_at ON role_configurations;
CREATE TRIGGER update_role_configurations_updated_at
    BEFORE UPDATE ON role_configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para system_settings
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();