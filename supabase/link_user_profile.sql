-- Run this after creating a user in Supabase Auth.
-- Change the email, full_name, role, and restaurant_slug values below before running.
-- Allowed roles: owner, admin, cashier, kitchen, courier

do $$
declare
  profile_email text := '76avcil@gmail.com';
  profile_full_name text := 'Yönetici Hesabı';
  profile_role text := 'owner';
  profile_restaurant_slug text := 'lezzet-bufe';
  target_user_id uuid;
  target_restaurant_id uuid;
begin
  if profile_role not in ('owner', 'admin', 'cashier', 'kitchen', 'courier') then
    raise exception 'Invalid role: %. Allowed roles: owner, admin, cashier, kitchen, courier', profile_role;
  end if;

  select auth.users.id
  into target_user_id
  from auth.users
  where lower(auth.users.email) = lower(profile_email)
  limit 1;

  if target_user_id is null then
    raise exception 'Auth user not found for email: %. Create the user in Supabase Auth first.', profile_email;
  end if;

  select public.restaurants.id
  into target_restaurant_id
  from public.restaurants
  where public.restaurants.slug = profile_restaurant_slug
  limit 1;

  if target_restaurant_id is null then
    raise exception 'Restaurant not found for slug: %. Run the setup/seed SQL first or change restaurant_slug.', profile_restaurant_slug;
  end if;

  insert into public.profiles (id, restaurant_id, full_name, role)
  values (target_user_id, target_restaurant_id, profile_full_name, profile_role)
  on conflict (id) do update
  set restaurant_id = excluded.restaurant_id,
      full_name = excluded.full_name,
      role = excluded.role,
      updated_at = now();
end $$;
