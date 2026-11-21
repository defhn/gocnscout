// Private, consistent PostgreSQL data snapshot. Never put the output in public/ or git.
const { Client } = require('pg');
const fs = require('fs');
const zlib = require('zlib');
const { once } = require('events');
require('dotenv').config({ path: '.env.local', quiet: true });
require('dotenv').config({ path: '.env', quiet: true });
const file = process.argv[2];
if (!file || !process.env.DATABASE_URL) throw new Error('Usage: node scripts/database/export.cjs private-backups/snapshot.jsonl.gz (DATABASE_URL required)');
const quote = s => '"' + s.replace(/"/g, '""') + '"';
(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000 });
  await client.connect();
  const output = fs.createWriteStream(file, { flags: 'wx', mode: 0o600 });
  const gzip = zlib.createGzip(); gzip.pipe(output);
  const write = async s => { if (!gzip.write(s)) await once(gzip, 'drain'); };
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> '_prisma_migrations' ORDER BY tablename");
    await write(JSON.stringify({ format: 'cnscout-pg-snapshot-v1', createdAt: new Date().toISOString(), tables: tables.rows.map(r => r.tablename) }) + '\n');
    for (const { tablename } of tables.rows) {
      await client.query(`DECLARE snapshot_cursor NO SCROLL CURSOR FOR SELECT row_to_json(t)::text AS data FROM public.${quote(tablename)} t`);
      let count = 0;
      for (;;) {
        const rows = (await client.query('FETCH FORWARD 500 FROM snapshot_cursor')).rows;
        for (const row of rows) { await write(JSON.stringify(tablename) + '\t' + row.data + '\n'); count++; }
        if (rows.length < 500) break;
      }
      await client.query('CLOSE snapshot_cursor');
      console.log(`${tablename}: ${count}`);
    }
    await client.query('COMMIT'); gzip.end(); await once(output, 'finish');
    console.log(`Snapshot saved: ${file}`);
  } catch (err) { gzip.destroy(); output.destroy(); await client.query('ROLLBACK').catch(()=>{}); console.error('Snapshot failed:', err.message); process.exitCode = 1; }
  finally { await client.end(); }
})().catch(err => { console.error(err.message); process.exitCode = 1; });
