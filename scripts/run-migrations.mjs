// Применяет SQL-миграции из supabase/migrations к базе Supabase.
// Строка подключения берётся из переменной DATABASE_URL (файл .env.local).
// Запуск: node --env-file=.env.local scripts/run-migrations.mjs [файл.sql ...]
// Без аргументов применяет все *.sql по порядку имён.
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
const files =
  args.length > 0
    ? args
    : readdirSync(migrationsDir)
        .filter((f) => f.endsWith(".sql"))
        .sort();

const client = new pg.Client({
  connectionString,
  // Supabase требует TLS; сертификат пула не проверяем строго.
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  for (const file of files) {
    const full = path.isAbsolute(file) ? file : path.join(migrationsDir, file);
    const sql = readFileSync(full, "utf8");
    process.stdout.write(`Применяю ${path.basename(full)} ... `);
    await client.query(sql);
    console.log("OK");
  }
  console.log("Готово: все миграции применены.");
} catch (err) {
  console.error("\nОшибка при выполнении миграции:");
  console.error(err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
