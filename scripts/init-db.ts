import fs from 'fs';
import path from 'path';
import { getDb } from '../src/lib/db';

async function initSql() {
  const db = await getDb();
  const schemaPath = path.resolve(process.cwd(), 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('[db] Executing schema.sql...');
  await db.exec(sql);
  console.log('[db] SQL database schema successfully created and verified.');
}

initSql().catch((err) => {
  console.error('[db] Error executing schema.sql:', err);
  process.exit(1);
});

