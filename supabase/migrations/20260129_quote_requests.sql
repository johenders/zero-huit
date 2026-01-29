create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  locale text not null default 'fr',
  name text not null,
  company text not null,
  email text not null,
  phone text,
  objectives text[] not null default '{}',
  audiences text[] not null default '{}',
  diffusions text[] not null default '{}',
  description text,
  locations text,
  deliverables jsonb not null default '{}'::jsonb,
  needs_subtitles boolean,
  upsells text[] not null default '{}',
  budget text,
  timeline text,
  referral text,
  reference_ids uuid[] not null default '{}',
  project_id uuid,
  project_title text,
  status text not null default 'new'
);

alter table public.quote_requests enable row level security;

drop policy if exists "quote_requests_insert_public" on public.quote_requests;
create policy "quote_requests_insert_public"
on public.quote_requests
for insert
to anon, authenticated
with check (true);

drop policy if exists "quote_requests_admin_select" on public.quote_requests;
create policy "quote_requests_admin_select"
on public.quote_requests
for select
to authenticated
using (public.is_admin());

drop policy if exists "quote_requests_admin_update" on public.quote_requests;
create policy "quote_requests_admin_update"
on public.quote_requests
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
