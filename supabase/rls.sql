alter table restaurants enable row level security;
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table tables enable row level security;
alter table expenses enable row level security;

create or replace function public.current_profile_restaurant_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select restaurant_id
  from public.profiles
  where id = auth.uid()
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
  where id = auth.uid()
$$;

grant execute on function public.current_profile_restaurant_id() to anon, authenticated;
grant execute on function public.current_profile_role() to anon, authenticated;

drop policy if exists "Users can read their restaurant" on restaurants;
create policy "Users can read their restaurant"
on restaurants for select
using (id = public.current_profile_restaurant_id());

drop policy if exists "Users can update their restaurant" on restaurants;
create policy "Users can update their restaurant"
on restaurants for update
using (id = public.current_profile_restaurant_id() and public.current_profile_role() in ('owner', 'admin'))
with check (id = public.current_profile_restaurant_id() and public.current_profile_role() in ('owner', 'admin'));

drop policy if exists "Users can read own profile" on profiles;
create policy "Users can read own profile"
on profiles for select
using (id = auth.uid());

drop policy if exists "Owners and admins can read restaurant profiles" on profiles;

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
on profiles for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Tenant select categories" on categories;
create policy "Tenant select categories"
on categories for select
to authenticated
using (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Public demo select active categories" on categories;
create policy "Public demo select active categories"
on categories for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Tenant insert categories" on categories;
create policy "Tenant insert categories"
on categories for insert
to authenticated
with check (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant update categories" on categories;
create policy "Tenant update categories"
on categories for update
to authenticated
using (restaurant_id = public.current_profile_restaurant_id())
with check (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant delete categories" on categories;
create policy "Tenant delete categories"
on categories for delete
to authenticated
using (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant select products" on products;
create policy "Tenant select products"
on products for select
to authenticated
using (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Public demo select available products" on products;
create policy "Public demo select available products"
on products for select
to anon, authenticated
using (is_available = true);

drop policy if exists "Tenant insert products" on products;
create policy "Tenant insert products"
on products for insert
to authenticated
with check (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant update products" on products;
create policy "Tenant update products"
on products for update
to authenticated
using (restaurant_id = public.current_profile_restaurant_id())
with check (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant delete products" on products;
create policy "Tenant delete products"
on products for delete
to authenticated
using (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant select orders" on orders;
create policy "Tenant select orders"
on orders for select
using (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant insert orders" on orders;
create policy "Tenant insert orders"
on orders for insert
with check (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant update orders" on orders;
create policy "Tenant update orders"
on orders for update
using (restaurant_id = public.current_profile_restaurant_id())
with check (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant delete orders" on orders;
create policy "Tenant delete orders"
on orders for delete
using (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant select order items" on order_items;
create policy "Tenant select order items"
on order_items for select
using (
  exists (
    select 1
    from orders
    where orders.id = order_items.order_id
      and orders.restaurant_id = public.current_profile_restaurant_id()
  )
);

drop policy if exists "Tenant insert order items" on order_items;
create policy "Tenant insert order items"
on order_items for insert
with check (
  exists (
    select 1
    from orders
    where orders.id = order_items.order_id
      and orders.restaurant_id = public.current_profile_restaurant_id()
  )
);

drop policy if exists "Tenant update order items" on order_items;
create policy "Tenant update order items"
on order_items for update
using (
  exists (
    select 1
    from orders
    where orders.id = order_items.order_id
      and orders.restaurant_id = public.current_profile_restaurant_id()
  )
)
with check (
  exists (
    select 1
    from orders
    where orders.id = order_items.order_id
      and orders.restaurant_id = public.current_profile_restaurant_id()
  )
);

drop policy if exists "Tenant delete order items" on order_items;
create policy "Tenant delete order items"
on order_items for delete
using (
  exists (
    select 1
    from orders
    where orders.id = order_items.order_id
      and orders.restaurant_id = public.current_profile_restaurant_id()
  )
);

drop policy if exists "Tenant select tables" on tables;
create policy "Tenant select tables"
on tables for select
using (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant insert tables" on tables;
create policy "Tenant insert tables"
on tables for insert
with check (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant update tables" on tables;
create policy "Tenant update tables"
on tables for update
using (restaurant_id = public.current_profile_restaurant_id())
with check (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant delete tables" on tables;
create policy "Tenant delete tables"
on tables for delete
using (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant select expenses" on expenses;
create policy "Tenant select expenses"
on expenses for select
using (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant insert expenses" on expenses;
create policy "Tenant insert expenses"
on expenses for insert
with check (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant update expenses" on expenses;
create policy "Tenant update expenses"
on expenses for update
using (restaurant_id = public.current_profile_restaurant_id())
with check (restaurant_id = public.current_profile_restaurant_id());

drop policy if exists "Tenant delete expenses" on expenses;
create policy "Tenant delete expenses"
on expenses for delete
using (restaurant_id = public.current_profile_restaurant_id());
