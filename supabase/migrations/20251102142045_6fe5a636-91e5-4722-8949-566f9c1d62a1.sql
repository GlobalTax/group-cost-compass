-- Añadir campos de estado de empleo a hr_employees
ALTER TABLE public.hr_employees
  ADD COLUMN employment_status TEXT DEFAULT 'active' CHECK (
    employment_status IN (
      'active',
      'leave_of_absence',        -- Excedencia
      'maternity_leave',         -- Baja maternal
      'paternity_leave',         -- Baja paternal
      'medical_leave',           -- Baja médica
      'sabbatical',              -- Sabático
      'unpaid_leave',            -- Permiso sin sueldo
      'suspended',               -- Suspendido
      'terminated'               -- Finalizado
    )
  ),
  ADD COLUMN leave_start_date DATE,
  ADD COLUMN leave_end_date DATE,
  ADD COLUMN leave_reason TEXT;

-- Crear índice para mejorar consultas de empleados activos
CREATE INDEX idx_hr_employees_employment_status ON public.hr_employees(employment_status);

-- Comentarios explicativos
COMMENT ON COLUMN public.hr_employees.employment_status IS 'Estado actual del empleado en la empresa';
COMMENT ON COLUMN public.hr_employees.leave_start_date IS 'Fecha de inicio de la ausencia (si aplica)';
COMMENT ON COLUMN public.hr_employees.leave_end_date IS 'Fecha estimada de retorno (puede ser null si es indefinida)';
COMMENT ON COLUMN public.hr_employees.leave_reason IS 'Motivo o notas sobre la ausencia';

-- Actualizar empleados existentes con termination_date a 'terminated'
UPDATE public.hr_employees
SET employment_status = 'terminated'
WHERE termination_date IS NOT NULL;