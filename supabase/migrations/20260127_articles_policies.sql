alter table public.articles enable row level security;

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
