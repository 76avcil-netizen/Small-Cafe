create extension if not exists pgcrypto;

create schema if not exists app_private;

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  phone text,
  address text,
  logo_url text,
  currency text not null default 'TRY',
  theme text not null default 'dark' check (theme in ('dark', 'warm', 'contrast')),
  opening_time time not null default '10:00',
  closing_time time not null default '23:30',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  restaurant_id uuid references public.restaurants(id) on delete set null,
  full_name text,
  role text not null default 'owner' check (role in ('owner', 'admin', 'cashier', 'kitchen', 'courier', 'operator')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  name text not null,
  slug text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (restaurant_id, slug)
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  is_available boolean default true,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (restaurant_id, name)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  order_number text not null,
  customer_name text,
  customer_phone text,
  delivery_address text,
  table_number integer check (table_number is null or table_number > 0),
  order_type text not null check (order_type in ('table', 'delivery', 'takeaway')),
  status text not null check (status in ('new', 'preparing', 'ready', 'delivered', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  payment_method text check (payment_method in ('cash', 'card', 'online')),
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (restaurant_id, order_number)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  total_price numeric(10,2) not null check (total_price >= 0),
  note text,
  created_at timestamptz default now()
);

create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  table_number integer not null,
  status text not null default 'empty' check (status in ('empty', 'occupied', 'payment_waiting', 'reserved')),
  current_total numeric(10,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (restaurant_id, table_number)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  title text not null,
  amount numeric(10,2) not null check (amount >= 0),
  category text,
  expense_date date not null default current_date,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.integration_accounts (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  provider text not null,
  status text not null default 'pending' check (status in ('pending', 'connected', 'error', 'disabled')),
  account_label text,
  credential_reference text,
  webhook_secret_reference text,
  last_checked_at timestamptz,
  last_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (restaurant_id, provider)
);

create table if not exists public.integration_events (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references public.restaurants(id) on delete set null,
  integration_account_id uuid references public.integration_accounts(id) on delete set null,
  provider text not null,
  event_type text not null,
  status text not null default 'received' check (status in ('received', 'processed', 'failed', 'ignored')),
  external_order_id text,
  summary text,
  payload jsonb,
  error_message text,
  received_at timestamptz default now(),
  processed_at timestamptz
);

create table if not exists public.operator_audit_logs (
  id uuid primary key default gen_random_uuid(),
  operator_profile_id uuid references public.profiles(id) on delete set null,
  restaurant_id uuid references public.restaurants(id) on delete set null,
  action text not null,
  target_type text,
  target_id text,
  details jsonb,
  created_at timestamptz default now()
);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_restaurants_updated_at on public.restaurants;
create trigger update_restaurants_updated_at
before update on public.restaurants
for each row execute function public.update_updated_at_column();

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

drop trigger if exists update_categories_updated_at on public.categories;
create trigger update_categories_updated_at
before update on public.categories
for each row execute function public.update_updated_at_column();

drop trigger if exists update_products_updated_at on public.products;
create trigger update_products_updated_at
before update on public.products
for each row execute function public.update_updated_at_column();

drop trigger if exists update_orders_updated_at on public.orders;
create trigger update_orders_updated_at
before update on public.orders
for each row execute function public.update_updated_at_column();

drop trigger if exists update_tables_updated_at on public.tables;
create trigger update_tables_updated_at
before update on public.tables
for each row execute function public.update_updated_at_column();

drop trigger if exists update_expenses_updated_at on public.expenses;
create trigger update_expenses_updated_at
before update on public.expenses
for each row execute function public.update_updated_at_column();

drop trigger if exists update_integration_accounts_updated_at on public.integration_accounts;
create trigger update_integration_accounts_updated_at
before update on public.integration_accounts
for each row execute function public.update_updated_at_column();

create index if not exists profiles_restaurant_id_idx on public.profiles(restaurant_id);
create index if not exists categories_restaurant_id_idx on public.categories(restaurant_id);
create index if not exists products_restaurant_id_idx on public.products(restaurant_id);
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists orders_restaurant_id_idx on public.orders(restaurant_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists tables_restaurant_id_idx on public.tables(restaurant_id);
create index if not exists expenses_restaurant_id_idx on public.expenses(restaurant_id);
create index if not exists expenses_expense_date_idx on public.expenses(expense_date);
create index if not exists integration_accounts_restaurant_id_idx on public.integration_accounts(restaurant_id);
create index if not exists integration_events_restaurant_id_idx on public.integration_events(restaurant_id);
create index if not exists integration_events_received_at_idx on public.integration_events(received_at);
create index if not exists operator_audit_logs_operator_profile_id_idx on public.operator_audit_logs(operator_profile_id);
create index if not exists operator_audit_logs_restaurant_id_idx on public.operator_audit_logs(restaurant_id);

create or replace function app_private.current_profile_restaurant_id()
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

create or replace function app_private.current_profile_role()
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

revoke all on schema app_private from public;
revoke all on function app_private.current_profile_restaurant_id() from public;
revoke all on function app_private.current_profile_role() from public;
grant usage on schema app_private to authenticated;
grant execute on function app_private.current_profile_restaurant_id() to authenticated;
grant execute on function app_private.current_profile_role() to authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.restaurants to authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.categories to anon;
grant select on public.products to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.products to authenticated;
grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
grant select, insert, update, delete on public.tables to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;
grant select, insert, update, delete on public.integration_accounts to authenticated;
grant select, insert, update, delete on public.integration_events to authenticated;
grant select, insert on public.operator_audit_logs to authenticated;

alter table public.restaurants enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.tables enable row level security;
alter table public.expenses enable row level security;
alter table public.integration_accounts enable row level security;
alter table public.integration_events enable row level security;
alter table public.operator_audit_logs enable row level security;

drop policy if exists "Users can read their restaurant" on public.restaurants;
create policy "Users can read their restaurant"
on public.restaurants for select
to authenticated
using (id = app_private.current_profile_restaurant_id());

drop policy if exists "Operators can read restaurants" on public.restaurants;
create policy "Operators can read restaurants"
on public.restaurants for select
to authenticated
using (app_private.current_profile_role() = 'operator');

drop policy if exists "Owners and admins can update their restaurant" on public.restaurants;
create policy "Owners and admins can update their restaurant"
on public.restaurants for update
to authenticated
using (id = app_private.current_profile_restaurant_id() and app_private.current_profile_role() in ('owner', 'admin'))
with check (id = app_private.current_profile_restaurant_id() and app_private.current_profile_role() in ('owner', 'admin'));

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

drop policy if exists "Operators can read profiles" on public.profiles;
create policy "Operators can read profiles"
on public.profiles for select
to authenticated
using (app_private.current_profile_role() = 'operator');

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists "Tenant select categories" on public.categories;
create policy "Tenant select categories"
on public.categories for select
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Public select active categories" on public.categories;
create policy "Public select active categories"
on public.categories for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Tenant insert categories" on public.categories;
create policy "Tenant insert categories"
on public.categories for insert
to authenticated
with check (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant update categories" on public.categories;
create policy "Tenant update categories"
on public.categories for update
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id())
with check (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant delete categories" on public.categories;
create policy "Tenant delete categories"
on public.categories for delete
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant select products" on public.products;
create policy "Tenant select products"
on public.products for select
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Public select available products" on public.products;
create policy "Public select available products"
on public.products for select
to anon, authenticated
using (is_available = true);

drop policy if exists "Tenant insert products" on public.products;
create policy "Tenant insert products"
on public.products for insert
to authenticated
with check (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant update products" on public.products;
create policy "Tenant update products"
on public.products for update
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id())
with check (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant delete products" on public.products;
create policy "Tenant delete products"
on public.products for delete
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant select orders" on public.orders;
create policy "Tenant select orders"
on public.orders for select
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant insert orders" on public.orders;
create policy "Tenant insert orders"
on public.orders for insert
to authenticated
with check (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant update orders" on public.orders;
create policy "Tenant update orders"
on public.orders for update
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id())
with check (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant delete orders" on public.orders;
create policy "Tenant delete orders"
on public.orders for delete
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant select order items" on public.order_items;
create policy "Tenant select order items"
on public.order_items for select
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.restaurant_id = app_private.current_profile_restaurant_id()
  )
);

drop policy if exists "Tenant insert order items" on public.order_items;
create policy "Tenant insert order items"
on public.order_items for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.restaurant_id = app_private.current_profile_restaurant_id()
  )
);

drop policy if exists "Tenant update order items" on public.order_items;
create policy "Tenant update order items"
on public.order_items for update
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.restaurant_id = app_private.current_profile_restaurant_id()
  )
)
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.restaurant_id = app_private.current_profile_restaurant_id()
  )
);

drop policy if exists "Tenant delete order items" on public.order_items;
create policy "Tenant delete order items"
on public.order_items for delete
to authenticated
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.restaurant_id = app_private.current_profile_restaurant_id()
  )
);

drop policy if exists "Tenant select tables" on public.tables;
create policy "Tenant select tables"
on public.tables for select
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant insert tables" on public.tables;
create policy "Tenant insert tables"
on public.tables for insert
to authenticated
with check (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant update tables" on public.tables;
create policy "Tenant update tables"
on public.tables for update
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id())
with check (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant delete tables" on public.tables;
create policy "Tenant delete tables"
on public.tables for delete
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant select expenses" on public.expenses;
create policy "Tenant select expenses"
on public.expenses for select
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant insert expenses" on public.expenses;
create policy "Tenant insert expenses"
on public.expenses for insert
to authenticated
with check (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant update expenses" on public.expenses;
create policy "Tenant update expenses"
on public.expenses for update
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id())
with check (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Tenant delete expenses" on public.expenses;
create policy "Tenant delete expenses"
on public.expenses for delete
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Operators can manage integration accounts" on public.integration_accounts;
create policy "Operators can manage integration accounts"
on public.integration_accounts for all
to authenticated
using (app_private.current_profile_role() = 'operator')
with check (app_private.current_profile_role() = 'operator');

drop policy if exists "Tenant select integration accounts" on public.integration_accounts;
create policy "Tenant select integration accounts"
on public.integration_accounts for select
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Operators can manage integration events" on public.integration_events;
create policy "Operators can manage integration events"
on public.integration_events for all
to authenticated
using (app_private.current_profile_role() = 'operator')
with check (app_private.current_profile_role() = 'operator');

drop policy if exists "Tenant select integration events" on public.integration_events;
create policy "Tenant select integration events"
on public.integration_events for select
to authenticated
using (restaurant_id = app_private.current_profile_restaurant_id());

drop policy if exists "Operators can read audit logs" on public.operator_audit_logs;
create policy "Operators can read audit logs"
on public.operator_audit_logs for select
to authenticated
using (app_private.current_profile_role() = 'operator');

drop policy if exists "Operators can insert audit logs" on public.operator_audit_logs;
create policy "Operators can insert audit logs"
on public.operator_audit_logs for insert
to authenticated
with check (app_private.current_profile_role() = 'operator');

with demo_restaurant as (
  insert into public.restaurants (name, slug, phone, address, currency)
  values ('Lezzet Büfe', 'lezzet-bufe', '0212 555 44 33', 'Merkez Mah. Lezzet Sok. No:12', 'TRY')
  on conflict (slug) do update
    set name = excluded.name,
        phone = excluded.phone,
        address = excluded.address,
        currency = excluded.currency,
        updated_at = now()
  returning id
),
category_seed as (
  select * from (values
    ('Sandviç & Tost', 'sandvic-tost', 10),
    ('Büfe Special', 'bufe-special', 20),
    ('Lavaşlar', 'lavaslar', 30),
    ('Burgerler', 'burgerler', 40),
    ('Köfteler', 'kofteler', 50),
    ('Salatalar', 'salatalar', 60),
    ('Ekstralar', 'ekstralar', 70),
    ('İçecekler', 'icecekler', 80)
  ) as categories(name, slug, sort_order)
),
upserted_categories as (
  insert into public.categories (restaurant_id, name, slug, sort_order, is_active)
  select demo_restaurant.id, category_seed.name, category_seed.slug, category_seed.sort_order, true
  from demo_restaurant, category_seed
  on conflict (restaurant_id, slug) do update
    set name = excluded.name,
        sort_order = excluded.sort_order,
        is_active = true,
        updated_at = now()
  returning id, restaurant_id, name
)
insert into public.products (restaurant_id, category_id, name, description, price, is_available)
select upserted_categories.restaurant_id, upserted_categories.id, product_seed.name, product_seed.description, product_seed.price, product_seed.is_available
from upserted_categories
join (values
  ('Santos', 'Özel soslu büfe lezzeti', 360.00, 'Büfe Special', true),
  ('Tavuk Dolma', 'Doyurucu tavuk dolma porsiyon', 550.00, 'Büfe Special', true),
  ('XL Tavuk Dolma', 'Büyük porsiyon tavuk dolma', 600.00, 'Büfe Special', true),
  ('Bulgur Köftesi', 'Ev yapımı bulgur köftesi', 150.00, 'Büfe Special', true),
  ('XL Tavuk Dolma + İçecek', 'Menü yanında seçili içecek', 650.00, 'Büfe Special', true),
  ('Kaşarlı Tost', 'Bol kaşarlı klasik tost', 180.00, 'Sandviç & Tost', true),
  ('Karışık Tost', 'Sucuk, kaşar ve domates', 220.00, 'Sandviç & Tost', true),
  ('Burger Menü', 'Patates ve içecek ile servis', 420.00, 'Burgerler', true),
  ('Köfte Ekmek', 'Izgara köfte ve taze garnitür', 300.00, 'Köfteler', true),
  ('Ayran', 'Soğuk kutu ayran', 50.00, 'İçecekler', true)
) as product_seed(name, description, price, category_name, is_available)
  on upserted_categories.name = product_seed.category_name
on conflict (restaurant_id, name) do update
  set category_id = excluded.category_id,
      description = excluded.description,
      price = excluded.price,
      is_available = excluded.is_available,
      updated_at = now();

with demo_restaurant as (
  select id
  from public.restaurants
  where slug = 'lezzet-bufe'
  limit 1
)
insert into public.expenses (restaurant_id, title, amount, category, expense_date)
select demo_restaurant.id, expense_seed.title, expense_seed.amount, expense_seed.category, current_date
from demo_restaurant
join (values
  ('Sebze ve garnitür', 280.00, 'Malzeme'),
  ('Paket malzemesi', 170.00, 'Paketleme'),
  ('Kurye yakıt desteği', 230.00, 'Operasyon')
) as expense_seed(title, amount, category) on true
where not exists (
  select 1
  from public.expenses existing_expense
  where existing_expense.restaurant_id = demo_restaurant.id
    and existing_expense.title = expense_seed.title
    and existing_expense.expense_date = current_date
);
