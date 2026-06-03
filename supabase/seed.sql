with demo_restaurant as (
  insert into restaurants (name, slug, phone, address, currency)
  values ('Lezzet Büfe', 'lezzet-bufe', '0212 555 44 33', 'Merkez Mah. Lezzet Sok. No:12', 'TRY')
  on conflict (slug) do update
    set name = excluded.name,
        phone = excluded.phone,
        address = excluded.address,
        currency = excluded.currency
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
inserted_categories as (
  insert into categories (restaurant_id, name, slug, sort_order)
  select demo_restaurant.id, category_seed.name, category_seed.slug, category_seed.sort_order
  from demo_restaurant, category_seed
  where not exists (
    select 1
    from categories existing_category
    where existing_category.restaurant_id = demo_restaurant.id
      and existing_category.slug = category_seed.slug
  )
  returning id, restaurant_id, name
),
all_categories as (
  select categories.id, categories.restaurant_id, categories.name
  from categories
  join demo_restaurant on categories.restaurant_id = demo_restaurant.id
)
insert into products (restaurant_id, category_id, name, description, price, is_available)
select all_categories.restaurant_id, all_categories.id, product_seed.name, product_seed.description, product_seed.price, product_seed.is_available
from all_categories
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
  on all_categories.name = product_seed.category_name
where not exists (
  select 1
  from products existing_product
  where existing_product.restaurant_id = all_categories.restaurant_id
    and existing_product.name = product_seed.name
);
