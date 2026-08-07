begin;

-- Amplía la tabla existente: conserva ids y relaciones products.category_id.
alter table public.categories
  add column if not exists is_featured boolean not null default false,
  add column if not exists image_storage_path text,
  add column if not exists desktop_banner_url text,
  add column if not exists desktop_banner_storage_path text,
  add column if not exists mobile_banner_url text,
  add column if not exists mobile_banner_storage_path text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists seo_keywords text[] not null default '{}'::text[],
  add column if not exists image_alt text,
  add column if not exists canonical_url text;

create index if not exists categories_active_idx on public.categories(is_active);
create index if not exists categories_featured_idx on public.categories(is_featured);
create index if not exists categories_sort_order_idx on public.categories(sort_order);

-- Impide también a nivel de base de datos borrar categorías en uso.
alter table public.products drop constraint if exists products_category_id_fkey;
alter table public.products add constraint products_category_id_fkey
  foreign key (category_id) references public.categories(id) on delete restrict;

alter table public.categories enable row level security;
drop policy if exists "Public can view active categories" on public.categories;
create policy "Public can view active categories" on public.categories for select to public using (is_active = true or public.is_staff());
drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories" on public.categories for insert to authenticated with check (public.is_admin());
drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories" on public.categories for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories" on public.categories for delete to authenticated using (public.is_admin());

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('category-images', 'category-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view category images" on storage.objects;
create policy "Public can view category images" on storage.objects for select to public using (bucket_id = 'category-images');
drop policy if exists "Admins can upload category images" on storage.objects;
create policy "Admins can upload category images" on storage.objects for insert to authenticated with check (bucket_id = 'category-images' and public.is_admin());
drop policy if exists "Admins can update category images" on storage.objects;
create policy "Admins can update category images" on storage.objects for update to authenticated using (bucket_id = 'category-images' and public.is_admin()) with check (bucket_id = 'category-images' and public.is_admin());
drop policy if exists "Admins can delete category images" on storage.objects;
create policy "Admins can delete category images" on storage.objects for delete to authenticated using (bucket_id = 'category-images' and public.is_admin());

commit;
