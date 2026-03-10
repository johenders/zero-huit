alter table public.videos
add column if not exists is_showcased boolean not null default false;
