alter table public.videos
add column if not exists featured_rating smallint not null default 0;

update public.videos
set featured_rating = 5
where is_featured = true
  and featured_rating = 0;

update public.videos
set is_featured = featured_rating > 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'videos_featured_rating_check'
      and conrelid = 'public.videos'::regclass
  ) then
    alter table public.videos
    add constraint videos_featured_rating_check
    check (featured_rating between 0 and 5);
  end if;
end $$;
