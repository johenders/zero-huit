do $$
begin
  alter type public.taxonomy_kind add value if not exists 'objectif';
exception
  when duplicate_object then null;
end $$;

insert into public.taxonomies (kind, label)
values
  ('objectif', 'Promotionnelle'),
  ('objectif', 'Recrutement'),
  ('objectif', 'Informatif'),
  ('objectif', 'Divertissement'),
  ('objectif', 'Événementiel'),
  ('objectif', 'Notoriété'),
  ('objectif', 'Éducatif'),
  ('objectif', 'Communautaire')
on conflict (kind, label) do nothing;
