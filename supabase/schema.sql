-- Extensions
create extension if not exists "pgcrypto";

-- Helpers
do $$
begin
  if not exists (select 1 from pg_type where typname = 'taxonomy_kind') then
    create type public.taxonomy_kind as enum (
      'type',
      'keyword',
      'style',
      'feel',
      'parametre',
      'objectif'
    );
  end if;
end $$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  cloudflare_uid text not null unique,
  status text not null default 'processing' check (status in ('processing', 'ready')),
  thumbnail_time_seconds integer,
  duration_seconds integer,
  budget_min integer,
  budget_max integer,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.taxonomies (
  id uuid primary key default gen_random_uuid(),
  kind public.taxonomy_kind not null,
  label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(kind, label)
);

create table if not exists public.video_taxonomies (
  video_id uuid not null references public.videos (id) on delete cascade,
  taxonomy_id uuid not null references public.taxonomies (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (video_id, taxonomy_id)
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  video_id uuid not null references public.videos (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, video_id)
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'project_objective') then
    create type public.project_objective as enum (
      'promotion',
      'recrutement',
      'informatif',
      'divertissement',
      'autre'
    );
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'project_diffusion') then
    create type public.project_diffusion as enum (
      'reseaux_sociaux',
      'web',
      'tv',
      'interne',
      'autre'
    );
  end if;
end $$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  budget integer,
  video_type text,
  objectives public.project_objective[] not null default '{}'::public.project_objective[],
  diffusions public.project_diffusion[] not null default '{}'::public.project_diffusion[],
  timeline text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_videos (
  project_id uuid not null references public.projects (id) on delete cascade,
  video_id uuid not null references public.videos (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, video_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists videos_set_updated_at on public.videos;
create trigger videos_set_updated_at
before update on public.videos
for each row execute procedure public.set_updated_at();

drop trigger if exists taxonomies_set_updated_at on public.taxonomies;
create trigger taxonomies_set_updated_at
before update on public.taxonomies
for each row execute procedure public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), 'user')
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  );
$$;
