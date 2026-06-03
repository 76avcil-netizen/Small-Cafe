alter table public.orders
add column if not exists table_number integer,
add column if not exists delivery_address text;

alter table public.orders
drop constraint if exists orders_table_number_check;

alter table public.orders
add constraint orders_table_number_check
check (table_number is null or table_number > 0);
