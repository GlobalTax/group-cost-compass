-- Política temporal para permitir UPDATE a usuarios anon (solo desarrollo)
CREATE POLICY "dev_anon_update_employees"
  ON public.hr_employees
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Actualizar dominio de email de @navarro.es a @nrro.es
UPDATE public.hr_employees
SET email = REPLACE(email, '@navarro.es', '@nrro.es')
WHERE email ILIKE '%@navarro.es';