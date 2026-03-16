import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, "002_render_schema.sql"), "utf8");

const client = new pg.Client({
  connectionString: "postgresql://palflixbackend_user:sF0ZBLT8bJRqfzf0MWnfKOykV9o2vrqk@dpg-d6rsbp9j16oc73ed2g4g-a.oregon-postgres.render.com/palflixbackend",
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log("Connected to Render PostgreSQL");
await client.query(sql);
console.log("Schema applied successfully");
await client.end();
