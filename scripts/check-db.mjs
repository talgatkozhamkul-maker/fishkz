// Быстрая проверка: что лежит в базе после миграций.
// Запуск: node --env-file=.env.local scripts/check-db.mjs
import pg from "pg";

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
const regions = await client.query("select count(*) from regions");
const waters = await client.query("select count(*) from water_bodies");
const pages = await client.query("select slug from pages order by slug");
console.log("Регионов:", regions.rows[0].count);
console.log("Водоёмов:", waters.rows[0].count);
console.log(
  "Страницы:",
  pages.rows.map((r) => r.slug).join(", "),
);
await client.end();
