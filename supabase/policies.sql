alter table public.profiles enable row level security;
alter table public.videos enable row level security;
alter table public.taxonomies enable row level security;
alter table public.video_taxonomies enable row level security;
alter table public.favorites enable row level security;
alter table public.projects enable row level security;
alter table public.project_videos enable row level security;
alter table public.articles enable row level security;
alter table public.translations enable row level security;
alter table public.taxonomy_translations enable row level security;

-- profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "profiles_update_own_name" on public.profiles;
create policy "profiles_update_own_name"
on public.profiles
for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and role = (
    select p.role from public.profiles p where p.user_id = auth.uid()
  )
);

-- videos (public read)
drop policy if exists "videos_select_all" on public.videos;
create policy "videos_select_all"
on public.videos
for select
to anon, authenticated
using (true);

drop policy if exists "videos_admin_write" on public.videos;
create policy "videos_admin_write"
on public.videos
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- taxonomies (public read)
drop policy if exists "taxonomies_select_all" on public.taxonomies;
create policy "taxonomies_select_all"
on public.taxonomies
for select
to anon, authenticated
using (true);

drop policy if exists "taxonomies_admin_write" on public.taxonomies;
create policy "taxonomies_admin_write"
on public.taxonomies
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- video_taxonomies (public read)
drop policy if exists "video_taxonomies_select_all" on public.video_taxonomies;
create policy "video_taxonomies_select_all"
on public.video_taxonomies
for select
to anon, authenticated
using (true);

drop policy if exists "video_taxonomies_admin_write" on public.video_taxonomies;
create policy "video_taxonomies_admin_write"
on public.video_taxonomies
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- favorites (private to the user)
drop policy if exists "favorites_select_own" on public.favorites;
create policy "favorites_select_own"
on public.favorites
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "favorites_insert_own" on public.favorites;
create policy "favorites_insert_own"
on public.favorites
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "favorites_delete_own" on public.favorites;
create policy "favorites_delete_own"
on public.favorites
for delete
to authenticated
using (user_id = auth.uid());

-- projects (private to the user)
drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
on public.projects
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
on public.projects
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
on public.projects
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
on public.projects
for delete
to authenticated
using (user_id = auth.uid());

-- project_videos (private to the user via project ownership)
drop policy if exists "project_videos_select_own" on public.project_videos;
create policy "project_videos_select_own"
on public.project_videos
for select
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "project_videos_insert_own" on public.project_videos;
create policy "project_videos_insert_own"
on public.project_videos
for insert
to authenticated
with check (
  exists (
    select 1
    from public.projects p
    where p.id = project_id
      and p.user_id = auth.uid()
  )
);

drop policy if exists "project_videos_delete_own" on public.project_videos;
create policy "project_videos_delete_own"
on public.project_videos
for delete
to authenticated
using (
  exists (
    select 1
    from public.projects p
    where p.id = project_id
      and p.user_id = auth.uid()
  )
);

-- articles (public read when published)
drop policy if exists "articles_select_published" on public.articles;
create policy "articles_select_published"
on public.articles
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "articles_admin_write" on public.articles;
create policy "articles_admin_write"
on public.articles
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- translations (public read)
drop policy if exists "translations_select_all" on public.translations;
create policy "translations_select_all"
on public.translations
for select
to anon, authenticated
using (true);

drop policy if exists "translations_admin_write" on public.translations;
create policy "translations_admin_write"
on public.translations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- taxonomy translations (public read)
drop policy if exists "taxonomy_translations_select_all" on public.taxonomy_translations;
create policy "taxonomy_translations_select_all"
on public.taxonomy_translations
for select
to anon, authenticated
using (true);

drop policy if exists "taxonomy_translations_admin_write" on public.taxonomy_translations;
create policy "taxonomy_translations_admin_write"
on public.taxonomy_translations
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- storage: articles cover images
drop policy if exists "storage_articles_public_read" on storage.objects;
create policy "storage_articles_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'articles');

drop policy if exists "storage_articles_admin_write" on storage.objects;
create policy "storage_articles_admin_write"
on storage.objects
for all
to authenticated
using (bucket_id = 'articles' and public.is_admin())
with check (bucket_id = 'articles' and public.is_admin());
