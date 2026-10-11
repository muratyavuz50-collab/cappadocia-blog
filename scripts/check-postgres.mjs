import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
const sql = neon(process.env.DATABASE_URL);
const rows = await sql`SELECT current_database() AS database, now() AS checked_at`;
console.log(`PostgreSQL connection OK: ${rows[0].database}`);
