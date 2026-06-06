create extension if not exists pgcrypto;

create table if not exists restaurants (
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

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  restaurant_id uuid references restaurants(id) on delete set null,
  full_name text,
  role text not null default 'owner' check (role in ('owner', 'admin', 'cashier', 'kitchen', 'courier', 'operator')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  slug text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  is_available boolean default true,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
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
  unique(restaurant_id, order_number)
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  consumable_item_id uuid,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  total_price numeric(10,2) not null check (total_price >= 0),
  is_complimentary boolean not null default false,
  note text,
  created_at timestamptz default now()
);

create table if not exists tables (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  table_number integer not null,
  status text not null default 'empty' check (status in ('empty', 'occupied', 'payment_waiting', 'reserved')),
  current_total numeric(10,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(restaurant_id, table_number)
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  title text not null,
  amount numeric(10,2) not null check (amount >= 0),
  category text,
  expense_date date not null default current_date,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists consumable_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  category text,
  quantity numeric(10,2) not null default 0 check (quantity >= 0),
  unit text not null default 'adet',
  unit_cost numeric(10,2) check (unit_cost is null or unit_cost >= 0),
  purchase_date date not null default current_date,
  expiry_date date,
  storage_location text,
  usage_type text not null default 'sarf' check (usage_type in ('ikram', 'sarf', 'mutfak', 'paketleme')),
  note text,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table order_items
  add column if not exists consumable_item_id uuid,
  add column if not exists is_complimentary boolean not null default false;

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_restaurants_updated_at on restaurants;
create trigger update_restaurants_updated_at
before update on restaurants
for each row execute function update_updated_at_column();

drop trigger if exists update_profiles_updated_at on profiles;
create trigger update_profiles_updated_at
before update on profiles
for each row execute function update_updated_at_column();

drop trigger if exists update_categories_updated_at on categories;
create trigger update_categories_updated_at
before update on categories
for each row execute function update_updated_at_column();

drop trigger if exists update_products_updated_at on products;
create trigger update_products_updated_at
before update on products
for each row execute function update_updated_at_column();

drop trigger if exists update_orders_updated_at on orders;
create trigger update_orders_updated_at
before update on orders
for each row execute function update_updated_at_column();

drop trigger if exists update_tables_updated_at on tables;
create trigger update_tables_updated_at
before update on tables
for each row execute function update_updated_at_column();

drop trigger if exists update_expenses_updated_at on expenses;
create trigger update_expenses_updated_at
before update on expenses
for each row execute function update_updated_at_column();

drop trigger if exists update_consumable_items_updated_at on consumable_items;
create trigger update_consumable_items_updated_at
before update on consumable_items
for each row execute function update_updated_at_column();

create index if not exists profiles_restaurant_id_idx on profiles(restaurant_id);
create index if not exists categories_restaurant_id_idx on categories(restaurant_id);
create index if not exists products_restaurant_id_idx on products(restaurant_id);
create index if not exists products_category_id_idx on products(category_id);
create index if not exists orders_restaurant_id_idx on orders(restaurant_id);
create index if not exists orders_status_idx on orders(status);
create index if not exists orders_created_at_idx on orders(created_at);
create index if not exists order_items_order_id_idx on order_items(order_id);
create index if not exists order_items_consumable_item_id_idx on order_items(consumable_item_id);
create index if not exists tables_restaurant_id_idx on tables(restaurant_id);
create index if not exists expenses_restaurant_id_idx on expenses(restaurant_id);
create index if not exists expenses_expense_date_idx on expenses(expense_date);
create index if not exists consumable_items_restaurant_id_idx on consumable_items(restaurant_id);
create index if not exists consumable_items_expiry_date_idx on consumable_items(expiry_date);

alter table order_items
  drop constraint if exists order_items_consumable_item_id_fkey,
  add constraint order_items_consumable_item_id_fkey
  foreign key (consumable_item_id) references consumable_items(id) on delete set null;
