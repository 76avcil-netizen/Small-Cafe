do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'products', 'categories')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end $$;

create policy "Users can read own profile"
on public.profiles for select
using (id = auth.uid());

create policy "Public demo select active categories"
on public.categories for select
to anon, authenticated
using (is_active = true);

create policy "Public demo select available products"
on public.products for select
to anon, authenticated
using (is_available = true);
