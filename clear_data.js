const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const client = await pool.connect();
    console.log("Wiping transactions via pg direct pool...");
    await client.query('DELETE FROM "Transfer"');
    await client.query('DELETE FROM "Transaction"');
    await client.query('DELETE FROM "Budget"');
    await client.query('DELETE FROM "FinancialYear"');
    await client.query('DELETE FROM "Account"');
    console.log("Successfully wiped database tables!");
    client.release();
  } catch (e) {
    console.error("Failed to wipe:", e);
  } finally {
    await pool.end();
  }
}
main();
