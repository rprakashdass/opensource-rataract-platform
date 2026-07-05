import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const poolDb = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkTables() {
  const c = await poolDb.connect();
  try {
    const res = await c.query('SELECT * FROM "public"."Announcement" LIMIT 1;');
    console.log("Announcement Table Content:", res.rows);
  } catch (err) {
    console.error("Query Error:", err);
  } finally {
    c.release();
    poolDb.end();
  }
}

checkTables();
