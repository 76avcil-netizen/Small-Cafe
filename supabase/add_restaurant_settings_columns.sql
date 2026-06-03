alter table public.restaurants
add column if not exists theme text not null default 'dark',
add column if not exists opening_time time not null default '10:00',
add column if not exists closing_time time not null default '23:30';

alter table public.restaurants
drop constraint if exists restaurants_theme_check;

alter table public.restaurants
add constraint restaurants_theme_check
check (theme in ('dark', 'warm', 'contrast'));
