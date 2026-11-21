// Restore a snapshot only into an empty, already migrated local PostgreSQL database.
const { Client } = require('pg');
const fs = require('fs'); const zlib = require('zlib'); const readline = require('readline');
const file = process.argv[2];
const url = process.env.RESTORE_DATABASE_URL;
if (!file || !url) throw new Error('Usage: RESTORE_DATABASE_URL=... node scripts/database/restore.cjs snapshot.jsonl.gz');
const host = new URL(url).hostname;
if (!['localhost','127.0.0.1','::1','[::1]'].includes(host)) throw new Error('Restore is restricted to localhost. Run this on the database server with a localhost URL.');
const quote = s => '"' + s.replace(/"/g, '""') + '"';
(async () => {
 const c = new Client({connectionString:url}); await c.connect();
 try {
  await c.query('BEGIN');
  const rl = readline.createInterface({input:fs.createReadStream(file).pipe(zlib.createGunzip()), crlfDelay:Infinity});
  let meta; const rows = new Map();
  for await (const line of rl) {
   if (!meta) { meta=JSON.parse(line); if(meta.format!=='cnscout-pg-snapshot-v1') throw new Error('Invalid snapshot'); for(const t of meta.tables) rows.set(t,[]); continue; }
   const i=line.indexOf('\t'); const table=JSON.parse(line.slice(0,i)); if(!rows.has(table)) throw new Error('Invalid table in snapshot'); rows.get(table).push(line.slice(i+1));
  }
  if(!meta) throw new Error('Empty snapshot');
  const actual=(await c.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> '_prisma_migrations' ORDER BY tablename")).rows.map(r=>r.tablename);
  if(JSON.stringify(actual)!==JSON.stringify([...meta.tables].sort())) throw new Error('Schema tables differ: migrate the matching application schema before restoring.');
  const cols=(await c.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, column_name")).rows;
  for (const table of actual) {
   if (!rows.get(table).length) continue;
   const source=Object.keys(JSON.parse(rows.get(table)[0])).sort();
   const target=cols.filter(r=>r.table_name===table).map(r=>r.column_name).sort();
   if (JSON.stringify(source)!==JSON.stringify(target)) throw new Error(`Schema columns differ for ${table}; restore stopped.`);
  }
  for(const table of actual) { const n=await c.query(`SELECT EXISTS (SELECT 1 FROM public.${quote(table)}) AS occupied`); if(n.rows[0].occupied) throw new Error(`Target table ${table} is not empty. Restore stopped.`); }
  const dependencies=(await c.query(`SELECT child.relname AS child, parent.relname AS parent FROM pg_constraint fk JOIN pg_class child ON child.oid=fk.conrelid JOIN pg_class parent ON parent.oid=fk.confrelid JOIN pg_namespace n ON n.oid=child.relnamespace WHERE fk.contype='f' AND n.nspname='public' AND child.relname <> parent.relname`)).rows;
  const done=new Set();
  while(done.size<actual.length) {
   const ready=actual.filter(t=>!done.has(t) && dependencies.filter(d=>d.child===t && actual.includes(d.parent)).every(d=>done.has(d.parent)));
   if(!ready.length) throw new Error('Circular foreign keys require a manual restore.');
   for(const table of ready) {
    const data=rows.get(table); for(let i=0;i<data.length;i+=200) await c.query(`INSERT INTO public.${quote(table)} SELECT * FROM json_populate_recordset(NULL::public.${quote(table)}, $1::json)`,['['+data.slice(i,i+200).join(',')+']']);
    const result=await c.query(`SELECT count(*)::int AS n FROM public.${quote(table)}`); if(result.rows[0].n!==data.length) throw new Error(`Count mismatch: ${table}`);
    console.log(`${table}: ${data.length}`); done.add(table);
   }
  }
  await c.query('COMMIT'); console.log('Restore committed.');
 } catch(e) { await c.query('ROLLBACK'); console.error('Restore rolled back:',e.message); process.exitCode=1; } finally { await c.end(); }
})().catch(e=>{console.error(e.message);process.exitCode=1});
