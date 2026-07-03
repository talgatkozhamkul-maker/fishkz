// Применяет SQL-миграции из supabase/migrations к базе Supabase.
// Ведёт журнал применённых файлов в таблице schema_migrations — повторный
// запуск пропускает уже применённые миграции (рекомендация аудита).
//
// Строка подключения: переменная DATABASE_URL из .env.local (только локально,
// в Vercel этот секрет НЕ добавлять — приложению в рантайме он не нужен).
//
// Запуск: node --env-file=.env.local scripts/run-migrations.mjs
// Принудительно один файл: node --env-file=.env.local scripts/run-migrations.mjs --force 0002_rebuild_seed.sql
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const migrationsDir = path.join(root, "supabase", "migrations");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Ошибка: не задана переменная DATABASE_URL в .env.local");
  process.exit(1);
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const requested = args.filter((a) => !a.startsWith("--"));

const files =
  requested.length > 0
    ? requested
    : readdirSync(migrationsDir)
        .filter((f) => f.endsWith(".sql"))
        .sort();

const client = new pg.Client({
  connectionString,
  // Пулер Supabase использует сертификат, который не проверяется системными CA.
  // Для CI/прода скачайте CA (Project Settings → Database → SSL certificate)
  // и укажите ssl: { ca: readFileSync('prod-ca-2021.crt', 'utf8') }.
  // Для локальных запусков из доверенной сети допустим режим без проверки:
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(
    `create table if not exists schema_migrations (
       filename   text primary key,
       applied_at timestamptz not null default now()
     )`,
  );

  const { rows } = await client.query("select filename from schema_migrations");
  const applied = new Set(rows.map((r) => r.filename));

  let ran = 0;
  for (const file of files) {
    const base = path.basename(file);
    if (applied.has(base) && !force) {
      console.log(`Пропускаю ${base} (уже применена)`);
      continue;
    }
    const full = path.isAbsolute(file) ? file : path.join(migrationsDir, file);
    const sql = readFileSync(full, "utf8");
    process.stdout.write(`Применяю ${base} ... `);
    await client.query(sql);
    await client.query(
      "insert into schema_migrations (filename) values ($1) on conflict (filename) do nothing",
      [base],
    );
    console.log("OK");
    ran++;
  }
  console.log(ran > 0 ? `Готово: применено миграций — ${ran}.` : "Новых миграций нет.");
} catch (err) {
  console.error("\nОшибка при выполнении миграции:");
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
