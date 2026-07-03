-- ============================================================================
-- Миграция 0001 (пересборка): полная схема FishKZ v2
-- Сносит схему Фазы 1 (тестовый каталог) и создаёт новую модель данных:
-- каталог + виды рыб + объявления + профили + инфо-страницы + Storage.
-- Все таблицы — с RLS (правило проекта). Политики построены по рекомендациям
-- аудита безопасности: security definer для админ-проверок, запрет
-- самопубликации объявлений, колоночные гранты против эскалации is_admin.
-- ============================================================================

-- === Снос старой схемы ======================================================
drop table if exists water_bodies cascade;
drop table if exists regions cascade;
drop table if exists pages cascade;
drop type if exists water_type cascade;
drop type if exists water_status cascade;

-- === Типы ===================================================================
create type water_type as enum ('lake', 'river', 'pond', 'reservoir');
create type publish_status as enum ('active', 'hidden');
create type managed_status as enum ('reserved', 'assigned');
-- reserved = резервный фонд (свободный любительский лов)
-- assigned = закреплён за субъектом рыбного хозяйства (нужна путёвка)
create type listing_category as enum ('putevka', 'guide', 'tour', 'base', 'companion', 'service');
create type listing_status as enum ('pending', 'active', 'hidden', 'archived');

-- === regions: области Казахстана ===========================================
create table regions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

-- === fish_species: справочник видов рыб =====================================
create table fish_species (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  latin       text,
  description text not null default '',
  season      text not null default '',   -- когда клюёт
  methods     text not null default '',   -- способы ловли
  sort_order  int  not null default 0
);

-- === water_bodies: водоёмы ==================================================
create table water_bodies (
  id             uuid primary key default gen_random_uuid(),
  region_id      uuid not null references regions (id) on delete cascade,
  name           text not null,
  slug           text not null unique,
  description    text not null default '',
  water_type     water_type not null,
  lat            double precision,
  lng            double precision,
  photos         text[] not null default '{}',
  is_paid        boolean not null default false,
  managed_status managed_status not null default 'reserved',
  price_info     text,               -- напр. «Путёвка 2000 ₸/день»
  season_notes   text,               -- сезонность, лучшее время
  facilities     text[] not null default '{}', -- тэги: подъезд, базы, лодки...
  access_notes   text,               -- как добраться
  rules_text     text,               -- особые правила этого водоёма
  contacts       text,
  verified_at    date,               -- «данные проверены» — маркер свежести
  status         publish_status not null default 'active',
  created_at     timestamptz not null default now()
);

create index water_bodies_region_id_idx on water_bodies (region_id);

-- === water_body_fish: связка водоём ↔ вид рыбы ==============================
create table water_body_fish (
  water_body_id uuid not null references water_bodies (id) on delete cascade,
  fish_id       uuid not null references fish_species (id) on delete cascade,
  primary key (water_body_id, fish_id)
);

create index water_body_fish_fish_idx on water_body_fish (fish_id);

-- === profiles: профили пользователей ========================================
-- id совпадает с auth.uid(); строка создаётся триггером при регистрации.
-- Сознательно БЕЗ FK на auth.users: это позволяет иметь демо-профили в сиде
-- (авторы демонстрационных объявлений) без записи в служебную схему auth.
create table profiles (
  id           uuid primary key,
  display_name text not null default '',
  phone        text,
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Профиль создаётся автоматически при появлении пользователя в auth.users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(split_part(new.email, '@', 1), ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- === listings: объявления ===================================================
create table listings (
  id               uuid primary key default gen_random_uuid(),
  author_id        uuid not null references profiles (id) on delete cascade,
  category         listing_category not null,
  title            text not null,
  description      text not null default '',
  price            int,                -- тенге
  price_unit       text,               -- «за день», «за место», «за тур»
  region_id        uuid references regions (id) on delete set null,
  water_body_id    uuid references water_bodies (id) on delete set null,
  photos           text[] not null default '{}',
  contact_phone    text,
  contact_whatsapp text,               -- номер для wa.me
  contact_telegram text,               -- username без @
  kaspi_link       text,               -- только https://pay.kaspi.kz/...
  status           listing_status not null default 'pending',
  created_at       timestamptz not null default now()
);

create index listings_status_created_idx on listings (status, created_at desc);
create index listings_region_idx on listings (region_id);
create index listings_water_body_idx on listings (water_body_id);
create index listings_author_idx on listings (author_id);

-- Анти-спам: не более 5 объявлений в сутки на пользователя (рекомендация
-- аудита: триггер надёжнее проверки в приложении).
create or replace function public.enforce_listing_daily_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (select count(*) from listings
      where author_id = new.author_id
        and created_at > now() - interval '24 hours') >= 5 then
    raise exception 'daily_listing_limit';
  end if;
  return new;
end;
$$;

drop trigger if exists listings_daily_limit on listings;
create trigger listings_daily_limit
  before insert on listings
  for each row execute function public.enforce_listing_daily_limit();

-- === pages: инфо-страницы (markdown) ========================================
create table pages (
  slug       text primary key,
  title      text not null,
  content_md text not null default '',
  updated_at timestamptz not null default now()
);

-- === Админ-проверка без рекурсии RLS ========================================
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false);
$$;

-- === Row Level Security =====================================================
alter table regions         enable row level security;
alter table fish_species    enable row level security;
alter table water_bodies    enable row level security;
alter table water_body_fish enable row level security;
alter table profiles        enable row level security;
alter table listings        enable row level security;
alter table pages           enable row level security;

-- Публичное чтение справочников
create policy "regions public read"      on regions      for select using (true);
create policy "fish public read"         on fish_species for select using (true);
create policy "pages public read"        on pages        for select using (true);
create policy "water fish public read"   on water_body_fish for select using (true);
create policy "active waters public read" on water_bodies for select
  using (status = 'active' or is_admin());

-- Объявления: публично видны active; автор видит свои; админ видит все
create policy "listings public read" on listings for select
  using (status = 'active' or author_id = auth.uid() or is_admin());

-- Создание объявления: только своё и только в статусе pending (модерация)
create policy "listings insert own pending" on listings for insert
  with check (author_id = auth.uid() and status = 'pending');

-- Автор может править своё, но НЕ может сам активировать (только скрыть/архив)
create policy "listings update own" on listings for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid() and status in ('pending', 'hidden', 'archived'));

create policy "listings delete own" on listings for delete
  using (author_id = auth.uid());

-- Админ: полный доступ к модерации и справочникам
create policy "listings admin all" on listings for all
  using (is_admin()) with check (is_admin());
create policy "waters admin write" on water_bodies for all
  using (is_admin()) with check (is_admin());
create policy "regions admin write" on regions for all
  using (is_admin()) with check (is_admin());
create policy "fish admin write" on fish_species for all
  using (is_admin()) with check (is_admin());
create policy "water fish admin write" on water_body_fish for all
  using (is_admin()) with check (is_admin());
create policy "pages admin write" on pages for all
  using (is_admin()) with check (is_admin());

-- Профили: чтение своего профиля; правка — только своих контактных полей.
create policy "profiles read own" on profiles for select
  using (id = auth.uid() or is_admin());
create policy "profiles update own" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Защита от эскалации: колонка is_admin недоступна клиентским ролям на запись
-- (колоночные гранты работают ПОВЕРХ RLS — обновить можно только эти колонки).
revoke update on table profiles from authenticated, anon;
grant update (display_name, phone) on table profiles to authenticated;

-- === Storage: bucket для фото объявлений ====================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos', 'listing-photos', true,
  5242880, -- 5 МБ
  array['image/jpeg', 'image/png', 'image/webp'] -- без SVG (рекомендация аудита)
)
on conflict (id) do update
  set file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Запись только в свою папку {uid}/..., публичное чтение
drop policy if exists "listing photos public read" on storage.objects;
create policy "listing photos public read" on storage.objects for select
  using (bucket_id = 'listing-photos');

drop policy if exists "listing photos insert own" on storage.objects;
create policy "listing photos insert own" on storage.objects for insert
  with check (
    bucket_id = 'listing-photos'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "listing photos delete own" on storage.objects;
create policy "listing photos delete own" on storage.objects for delete
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
