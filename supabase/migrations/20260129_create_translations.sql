create table if not exists public.translations (
  key text not null,
  locale text not null,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (key, locale)
);

create table if not exists public.taxonomy_translations (
  taxonomy_id uuid not null references public.taxonomies (id) on delete cascade,
  locale text not null,
  label text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (taxonomy_id, locale)
);

drop trigger if exists translations_set_updated_at on public.translations;
create trigger translations_set_updated_at
before update on public.translations
for each row execute procedure public.set_updated_at();

drop trigger if exists taxonomy_translations_set_updated_at on public.taxonomy_translations;
create trigger taxonomy_translations_set_updated_at
before update on public.taxonomy_translations
for each row execute procedure public.set_updated_at();
