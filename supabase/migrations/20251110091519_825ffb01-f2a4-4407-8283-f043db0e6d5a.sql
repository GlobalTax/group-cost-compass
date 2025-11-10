create table if not exists public.scheduled_exports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  
  org_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  
  export_type text not null check (export_type in ('dashboard_pdf', 'costs_excel', 'revenues_excel', 'compensation_excel')),
  frequency text not null check (frequency in ('monthly', 'quarterly', 'yearly')),
  schedule_day int not null check (schedule_day between 1 and 31),
  schedule_time time not null default '09:00:00',
  
  company_id uuid references public.companies(id) on delete set null,
  year int,
  
  recipient_emails text[] not null default '{}',
  
  is_active boolean not null default true,
  last_run_at timestamp with time zone,
  next_run_at timestamp with time zone,
  last_run_status text check (last_run_status in ('success', 'failed', 'running')),
  last_run_error text,
  
  metadata jsonb default '{}'::jsonb
);

create index if not exists idx_scheduled_exports_org_id on public.scheduled_exports(org_id);
create index if not exists idx_scheduled_exports_next_run on public.scheduled_exports(next_run_at) where is_active = true;

alter table public.scheduled_exports enable row level security;

create policy "Usuarios pueden gestionar exports de su org"
  on public.scheduled_exports for all
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role in ('super_admin', 'admin')
    )
  );

comment on table public.scheduled_exports is 'Configuración de exportaciones automáticas programadas';