-- Tabla de logs de importaciones
create table if not exists public.import_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  
  -- Identificación
  user_id uuid references auth.users(id) on delete set null not null,
  org_id uuid not null,
  
  -- Tipo de importación
  import_type text not null check (import_type in ('a3nom', 'employees', 'revenues', 'manual')),
  
  -- Período de los datos
  period text,
  
  -- Métricas
  total_records int not null default 0,
  successful_records int not null default 0,
  failed_records int not null default 0,
  employees_created int not null default 0,
  
  -- Tiempo de ejecución
  duration_ms int,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  
  -- Estado
  status text not null check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Errores y warnings
  errors jsonb default '[]'::jsonb,
  warnings jsonb default '[]'::jsonb,
  
  -- Metadata adicional
  file_name text,
  file_size_kb int,
  metadata jsonb
);

-- Índices
create index if not exists idx_import_logs_created_at on public.import_logs(created_at desc);
create index if not exists idx_import_logs_user_id on public.import_logs(user_id);
create index if not exists idx_import_logs_org_id on public.import_logs(org_id);
create index if not exists idx_import_logs_status on public.import_logs(status);
create index if not exists idx_import_logs_type on public.import_logs(import_type);

-- RLS
alter table public.import_logs enable row level security;

create policy "Usuarios pueden ver logs de su org"
  on public.import_logs for select
  using (
    org_id = (select org_id from public.user_roles where user_id = auth.uid() limit 1)
  );

create policy "Usuarios pueden insertar logs de su org"
  on public.import_logs for insert
  with check (
    org_id = (select org_id from public.user_roles where user_id = auth.uid() limit 1)
  );

comment on table public.import_logs is 'Historial de importaciones de datos (A3Nom, empleados, ingresos)';