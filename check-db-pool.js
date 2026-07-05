const { Client } = require('pg');
async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL.replace('?pgbouncer=true', '') });
  await client.connect();
  try {
    const res = await client.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'User\';');
    console.log(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
main();
