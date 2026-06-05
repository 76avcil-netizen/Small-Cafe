create or replace function public.current_profile_restaurant_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select restaurant_id
  from public.profiles
  where id = (select auth.uid())
$$;

create or replace function public.current_profile_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role
  from public.profiles
  where id = (select auth.uid())
$$;

revoke all on function public.current_profile_restaurant_id() from public;
revoke all on function public.current_profile_role() from public;
grant execute on function public.current_profile_restaurant_id() to authenticated;
grant execute on function public.current_profile_role() to authenticated;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
  loop
    execute format('drop policy if exists %I on public.profiles', policy_record.policyname);
  end loop;
end $$;

create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "Tenant select categories" on public.categories;
create policy "Tenant select categories"
on public.categories for select
to authenticated
using (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Public demo select active categories" on public.categories;
create policy "Public demo select active categories"
on public.categories for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Tenant select products" on public.products;
create policy "Tenant select products"
on public.products for select
to authenticated
using (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Public demo select available products" on public.products;
create policy "Public demo select available products"
on public.products for select
to anon, authenticated
using (is_available = true);
