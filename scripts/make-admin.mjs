// Назначает пользователя админом по e-mail (после его первого входа на сайт).
// Запуск: node --env-file=.env.local scripts/make-admin.mjs you@example.com
import pg from "pg";

const email = process.argv[2];
if (!email || !process.env.DATABASE_URL) {
  console.error("Использование: node --env-file=.env.local scripts/make-admin.mjs <email>");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // см. комментарий в run-migrations.mjs
});

await client.connect();
const { rows } = await client.query(
  `update profiles set is_admin = true
   where id = (select id from auth.users where email = $1)
   returning id, display_name`,
  [email],
);
await client.end();

if (rows.length === 0) {
  console.error(`Пользователь ${email} не найден. Сначала войдите на сайт этим e-mail.`);
  process.exit(1);
}
console.log(`Готово: ${email} теперь админ (profile ${rows[0].id}).`);
