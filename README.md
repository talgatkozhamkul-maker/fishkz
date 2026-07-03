# FishKZ — справочник рыбака Казахстана

PWA-каталог водоёмов Казахстана: какая рыба клюёт, правила и платность,
маршруты в 2ГИС, доска объявлений (путёвки, гиды, туры, базы, попутчики).

**Прод:** https://fishkz.vercel.app

## Стек
Next.js 16 (App Router, TypeScript, Tailwind v4) · Supabase (Postgres + Auth
OTP + Storage, всё под RLS) · Vercel (push в `main` → автодеплой).

## Запуск локально
```bash
cp .env.example .env.local   # заполнить ключи Supabase
npm install
npm run dev
```

## Команды
```bash
node --env-file=.env.local scripts/run-migrations.mjs     # миграции БД
node --env-file=.env.local scripts/make-admin.mjs <email>  # назначить админа
node scripts/gen-icons.mjs                                 # PWA-иконки
```

Документация: [SPEC.md](SPEC.md) · [PLAN.md](PLAN.md) · [BACKLOG.md](BACKLOG.md) ·
правила для Claude Code — [CLAUDE.md](CLAUDE.md).
