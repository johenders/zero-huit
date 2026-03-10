alter table public.videos
add column if not exists is_published boolean not null default true;
