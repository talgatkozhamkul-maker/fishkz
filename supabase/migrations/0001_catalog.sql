-- Миграция 0001: каталог (регионы, водоёмы, инфо-страницы)
-- Фаза 1 по PLAN.md. Все таблицы создаются сразу с RLS (правило проекта).

-- === Типы-перечисления =====================================================
create type water_type as enum ('lake', 'river', 'pond', 'reservoir');
create type water_status as enum ('active', 'hidden');

-- === Таблица: regions (регионы/области) ====================================
create table regions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

-- === Таблица: water_bodies (водоёмы) =======================================
create table water_bodies (
  id          uuid primary key default gen_random_uuid(),
  region_id   uuid not null references regions (id) on delete cascade,
  name        text not null,
  slug        text not null unique,
  description text,
  water_type  water_type not null,
  lat         double precision,
  lng         double precision,
  photos      text[] not null default '{}',
  is_paid     boolean not null default false,
  rules_text  text,
  contacts    text,
  status      water_status not null default 'active',
  created_at  timestamptz not null default now()
);

create index water_bodies_region_id_idx on water_bodies (region_id);

-- === Таблица: pages (инфо-страницы) ========================================
create table pages (
  slug       text primary key,
  title      text not null,
  content_md text not null default '',
  updated_at timestamptz not null default now()
);

-- === Row Level Security =====================================================
-- Включаем RLS на всех таблицах. Без политик доступ будет закрыт по умолчанию.
alter table regions      enable row level security;
alter table water_bodies enable row level security;
alter table pages        enable row level security;

-- Публичное чтение: регионы и страницы видны всем (гостям в том числе).
create policy "regions are public"
  on regions for select
  using (true);

create policy "pages are public"
  on pages for select
  using (true);

-- Водоёмы: публично видны только активные (status = 'active').
-- Скрытые водоёмы (status = 'hidden') доступны только админам (Фаза 4).
create policy "active water bodies are public"
  on water_bodies for select
  using (status = 'active');

-- Запись (insert/update/delete) в эти справочники политиками пока НЕ открыта,
-- поэтому при включённом RLS она запрещена для всех через публичный ключ.
-- Наполнять таблицы будем через SQL Editor (миграция с данными), а
-- админ-доступ на запись добавим в Фазе 4.
