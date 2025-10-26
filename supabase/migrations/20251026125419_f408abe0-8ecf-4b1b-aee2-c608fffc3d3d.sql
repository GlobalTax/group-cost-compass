-- Asignar todos los roles disponibles al usuario s.navarro@obn.es
DO $$
DECLARE
  v_user_id uuid := '1dacb84a-a1fe-4569-aea3-9f0e9be56e3e';
  v_org_id uuid := '10af28dc-a9b8-4f0a-889e-4732e07df038'; -- org "navarro"
  v_role text;
  v_roles text[] := ARRAY['super_admin', 'admin', 'manager', 'senior', 'junior', 'finance'];
BEGIN
  -- Insertar cada rol si no existe
  FOREACH v_role IN ARRAY v_roles
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = v_user_id AND role::text = v_role
    ) THEN
      INSERT INTO user_roles (user_id, role, org_id)
      VALUES (v_user_id, v_role::app_role, v_org_id);
      RAISE NOTICE 'Rol % asignado', v_role;
    ELSE
      RAISE NOTICE 'Rol % ya existe', v_role;
    END IF;
  END LOOP;

  RAISE NOTICE 'Todos los roles asignados correctamente al usuario s.navarro@obn.es';
END $$;