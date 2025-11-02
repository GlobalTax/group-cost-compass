-- Corregir la función auto_estimate_annual_salary para usar el nombre calificado public.hr_employees
-- Esto previene el error "relation hr_employees does not exist" cuando search_path está vacío

CREATE OR REPLACE FUNCTION public.auto_estimate_annual_salary()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Si el empleado no tiene annual_salary configurado, estimarlo automáticamente
  -- CRÍTICO: Usar public.hr_employees (nombre calificado) porque search_path está vacío
  UPDATE public.hr_employees
  SET annual_salary = (NEW.bruto * 14)
  WHERE id = NEW.employee_id
    AND annual_salary IS NULL;

  RETURN NEW;
END;
$function$;