# CLAUDE.md — FishKZ, справочник рыбака Казахстана

## О проекте
PWA-сервис: каталог водоёмов (17 областей, виды рыб, правила, платность),
доска объявлений услуг (путёвки, гиды, туры, базы, попутчики). MVP для проверки
спроса. Спецификация — SPEC.md (v0.2, после пересборки). Идеи — BACKLOG.md.

## О владельце проекта
Владелец — руководитель ИТ-проектов, НЕ программист. Поэтому:
- Перед любой нетривиальной работой предлагай краткий план и жди подтверждения.
- Работай маленькими шагами: одна фича — одна задача.
- Объясняй технические решения простым языком, без жаргона.
- После каждой задачи давай шаги ручной проверки на телефоне.

## Стек (зафиксирован)
- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4.
  ВАЖНО (Next 16): middleware называется proxy.ts; сегмент-конфиг revalidate
  работает (cacheComponents НЕ включать). Документация — node_modules/next/dist/docs.
- Supabase: Postgres, Auth (e-mail OTP), Storage. Vercel. PWA.
- Одобренные библиотеки: zod, react-markdown + remark-gfm, lucide-react.
  Новые — только после явного согласия владельца.

## Правила кода
- Server Components по умолчанию; client — только для интерактива.
- Три клиента Supabase, не смешивать:
  - lib/supabase/static.ts (anon, БЕЗ cookies) — публичный каталог, sitemap.
    Иначе страницы теряют статику/ISR.
  - lib/supabase/server.ts (cookies) — auth-потоки, server actions.
  - lib/supabase/client.ts — браузерные компоненты.
- Каждая таблица создаётся сразу с RLS. Админ-проверки — через security
  definer функцию is_admin(). Запись в profiles.is_admin клиентам закрыта
  колоночными грантами — не ослаблять.
- Ошибка запроса к БД — исключение (error.tsx), НЕ notFound() и НЕ пустой
  список. Хелперы — в src/lib/data.ts.
- Валидация форм zod с двух сторон (схемы в src/lib/validation.ts): телефоны
  → +7…, telegram → username, kaspi_link → только https://[pay.]kaspi.kz.
- Markdown — только через components/markdown.tsx (react-markdown без raw
  HTML) и только для админского контента; пользовательский ввод — plain text.
- Секреты только в .env.local. DATABASE_URL в Vercel НЕ добавлять.
- UI-тексты на русском, идентификаторы на английском.
- Перед миграцией БД — показать SQL владельцу и объяснить.

## Команды
- Миграции: `node --env-file=.env.local scripts/run-migrations.mjs`
  (журнал schema_migrations; повторный запуск безопасен).
- Назначить админа: `node --env-file=.env.local scripts/make-admin.mjs <email>`.
- Иконки PWA: `node scripts/gen-icons.mjs`.

## Скоуп и процесс
- Следуй SPEC.md; «Вне скоупа» (§7) не реализовывать — предлагай в BACKLOG.md.
- Коммит после каждой работающей фичи: `feat: ...` / `fix: ...` (англ.).
  Push в main автодеплоится на прод (Vercel). Автор коммитов —
  talgatkozhamkul@gmail.com (иначе Vercel блокирует деплой: COMMIT_AUTHOR_REQUIRED).
- Застрял дольше 2 часов — откат к последнему коммиту, задача мельче.
