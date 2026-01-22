begin;

-- Merge Animation/Animation 3D into "Animation 2D et 3D" (style)
with target as (
  select id
  from taxonomies
  where kind = 'style' and label = 'Animation 2D et 3D'
),
ensured as (
  insert into taxonomies (kind, label)
  select 'style', 'Animation 2D et 3D'
  where not exists (select 1 from target)
  returning id
),
target_id as (
  select id from target
  union all
  select id from ensured
),
sources as (
  select id
  from taxonomies
  where kind = 'style' and label in ('Animation', 'Animation 3D')
),
to_move as (
  select vt.video_id, (select id from target_id) as target_id
  from video_taxonomies vt
  join sources s on s.id = vt.taxonomy_id
)
insert into video_taxonomies (video_id, taxonomy_id)
select video_id, target_id from to_move
on conflict do nothing;

delete from video_taxonomies vt using sources s
where vt.taxonomy_id = s.id;

delete from taxonomies t using sources s
where t.id = s.id;

-- Merge "Voix-off" into "Voix off" (style)
with target as (
  select id
  from taxonomies
  where kind = 'style' and label = 'Voix off'
),
ensured as (
  insert into taxonomies (kind, label)
  select 'style', 'Voix off'
  where not exists (select 1 from target)
  returning id
),
target_id as (
  select id from target
  union all
  select id from ensured
),
sources as (
  select id
  from taxonomies
  where kind = 'style' and label in ('Voix-off')
),
to_move as (
  select vt.video_id, (select id from target_id) as target_id
  from video_taxonomies vt
  join sources s on s.id = vt.taxonomy_id
)
insert into video_taxonomies (video_id, taxonomy_id)
select video_id, target_id from to_move
on conflict do nothing;

delete from video_taxonomies vt using sources s
where vt.taxonomy_id = s.id;

delete from taxonomies t using sources s
where t.id = s.id;

commit;
