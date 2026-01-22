alter table public.videos
add column if not exists is_featured boolean not null default false;
