-- Tabla de métricas de rendimiento (Web Vitals)
create table if not exists public.performance_metrics (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  
  -- Identificación
  user_id uuid references auth.users(id) on delete set null,
  route text not null,
  user_agent text,
  
  -- Web Vitals
  metric_name text not null check (metric_name in ('CLS', 'FCP', 'LCP', 'TTFB', 'INP')),
  metric_value numeric not null,
  metric_rating text check (metric_rating in ('good', 'needs-improvement', 'poor')),
  
  -- Metadata
  session_id text,
  org_id uuid
);

-- Índices para queries rápidas
create index if not exists idx_perf_created_at on public.performance_metrics(created_at desc);
create index if not exists idx_perf_metric_name on public.performance_metrics(metric_name);
create index if not exists idx_perf_org_id on public.performance_metrics(org_id);
create index if not exists idx_perf_route on public.performance_metrics(route);

-- RLS Policies
alter table public.performance_metrics enable row level security;

create policy "Admin puede ver todas las métricas"
  on public.performance_metrics for select
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role in ('super_admin', 'admin')
    )
  );

create policy "Usuarios pueden insertar sus propias métricas"
  on public.performance_metrics for insert
  with check (auth.uid() = user_id);

comment on table public.performance_metrics is 'Métricas de rendimiento (Web Vitals) para monitoring';