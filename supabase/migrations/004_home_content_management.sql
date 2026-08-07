begin;

create table if not exists public.home_page_settings (
  id boolean primary key default true check (id),
  promo_enabled boolean not null default true,
  promo_text text not null,
  promo_icon text not null default '🌱',
  promo_url text not null default '',
  promo_button_text text not null default 'WhatsApp',
  promo_scroll boolean not null default true,
  promo_speed integer not null default 24 check (promo_speed between 5 and 120),
  promo_new_tab boolean not null default true,
  logo_enabled boolean not null default true,
  logo_desktop_url text not null default '/images/logo-desktop.png',
  logo_mobile_url text not null default '/images/logo-mobile.png',
  logo_alt text not null default 'Portal Verde',
  whatsapp_enabled boolean not null default true,
  services_enabled boolean not null default true,
  services_title text not null,
  services_description text not null,
  mega_menu_enabled boolean not null default true,
  mega_services_title text not null default 'Servicios Portal Verde',
  mega_services_description text not null default 'Una solución completa para tu espacio',
  updated_at timestamptz not null default now()
);

create table if not exists public.home_navigation_items (
  id uuid primary key default gen_random_uuid(), name text not null, url text not null,
  sort_order integer not null default 0, is_active boolean not null default true
);
create table if not exists public.home_service_tags (
  id uuid primary key default gen_random_uuid(), label text not null,
  sort_order integer not null default 0, is_active boolean not null default true
);
create table if not exists public.home_mega_columns (
  id uuid primary key default gen_random_uuid(), title text not null, icon text not null default 'Leaf',
  category_id uuid references public.categories(id) on delete set null, view_all_label text not null,
  view_all_url text not null, sort_order integer not null default 0, is_active boolean not null default true
);
create table if not exists public.home_mega_products (
  column_id uuid not null references public.home_mega_columns(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  sort_order integer not null default 0, primary key (column_id, product_id)
);
create table if not exists public.home_mega_services (
  id uuid primary key default gen_random_uuid(), title text not null, description text not null,
  icon text not null default 'Leaf', url text not null, sort_order integer not null default 0,
  is_active boolean not null default true
);
create table if not exists public.home_global_buttons (
  id uuid primary key default gen_random_uuid(), placement text not null, text text not null, url text not null,
  link_type text not null check (link_type in ('internal','external','whatsapp','anchor')),
  icon text not null default '', variant text not null default 'primary', sort_order integer not null default 0,
  is_active boolean not null default true, new_tab boolean not null default false
);
create table if not exists public.home_sections_config (
  section_key text primary key, title text not null, sort_order integer not null default 0,
  is_active boolean not null default true
);

insert into public.home_page_settings (id,promo_text,services_title,services_description)
values (true,'Césped Esmeralda desde Gs. 31.000 m² con instalación incluida',
  'Soluciones para transformar y mantener tus espacios verdes',
  'Además de productos, ofrecemos servicios especializados en jardinería, césped y mantenimiento.')
on conflict (id) do nothing;
insert into public.home_service_tags(label,sort_order) values
('Empastado',0),('Jardinería',1),('Poda de árboles',2),('Mantenimiento',3)
on conflict do nothing;
insert into public.home_sections_config(section_key,title,sort_order) values
('hero','Portada',0),('products-grass','Césped',1),('services','Servicios',2),('products-landscaping','Paisajismo',3)
on conflict (section_key) do nothing;

alter table public.home_page_settings enable row level security;
alter table public.home_navigation_items enable row level security;
alter table public.home_service_tags enable row level security;
alter table public.home_mega_columns enable row level security;
alter table public.home_mega_products enable row level security;
alter table public.home_mega_services enable row level security;
alter table public.home_global_buttons enable row level security;
alter table public.home_sections_config enable row level security;

do $$ declare table_name text; begin
  foreach table_name in array array['home_page_settings','home_navigation_items','home_service_tags','home_mega_columns','home_mega_products','home_mega_services','home_global_buttons','home_sections_config'] loop
    execute format('drop policy if exists "Public read %s" on public.%I', table_name, table_name);
    execute format('create policy "Public read %s" on public.%I for select to public using (true)', table_name, table_name);
    execute format('drop policy if exists "Admins manage %s" on public.%I', table_name, table_name);
    execute format('create policy "Admins manage %s" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', table_name, table_name);
    execute format('grant select on public.%I to anon, authenticated', table_name);
    execute format('grant insert, update, delete on public.%I to authenticated', table_name);
  end loop;
end $$;

commit;
