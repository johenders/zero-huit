create table if not exists public.calendar_integrations (
  id text primary key,
  account_email text not null,
  calendar_id text not null,
  refresh_token_encrypted text not null,
  scope text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.calendar_integrations enable row level security;

create table if not exists public.appointment_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  locale text not null default 'fr',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'America/Toronto',
  name text not null,
  company text not null,
  email text not null,
  phone text,
  budget text,
  referral text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'failed')),
  google_event_id text unique,
  google_event_url text,
  google_meet_url text,
  error_message text
);

alter table public.appointment_requests enable row level security;

create index if not exists appointment_requests_starts_at_idx
  on public.appointment_requests (starts_at);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointment_requests_no_overlap'
      and conrelid = 'public.appointment_requests'::regclass
  ) then
    alter table public.appointment_requests
    add constraint appointment_requests_no_overlap
    exclude using gist (
      tsrange(
        (starts_at at time zone 'UTC') - interval '30 minutes',
        (starts_at at time zone 'UTC') + interval '30 minutes',
        '[)'
      ) with &&
    )
    where (status in ('pending', 'confirmed'));
  end if;
end $$;

drop policy if exists "appointment_requests_admin_select"
  on public.appointment_requests;
create policy "appointment_requests_admin_select"
on public.appointment_requests
for select
to authenticated
using (public.is_admin());

drop policy if exists "appointment_requests_admin_update"
  on public.appointment_requests;
create policy "appointment_requests_admin_update"
on public.appointment_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop trigger if exists calendar_integrations_set_updated_at
  on public.calendar_integrations;
create trigger calendar_integrations_set_updated_at
before update on public.calendar_integrations
for each row execute procedure public.set_updated_at();

drop trigger if exists appointment_requests_set_updated_at
  on public.appointment_requests;
create trigger appointment_requests_set_updated_at
before update on public.appointment_requests
for each row execute procedure public.set_updated_at();
