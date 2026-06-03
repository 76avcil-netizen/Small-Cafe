-- Replace the email below if you create a different Supabase Auth user.
-- Run after schema.sql, rls.sql, seed.sql, and after creating the Auth user.

with target_user as (
  select id, email
  from auth.users
  where email = '76@gmail.com'
  limit 1
),
target_restaurant as (
  select id
  from public.restaurants
  where slug = 'lezzet-bufe'
  limit 1
)
insert into public.profiles (id, restaurant_id, full_name, role)
select target_user.id, target_restaurant.id, 'Yönetici Hesabı', 'owner'
from target_user, target_restaurant
on conflict (id) do update
set restaurant_id = excluded.restaurant_id,
    full_name = excluded.full_name,
    role = excluded.role,
    updated_at = now();
