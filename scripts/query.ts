import { getDb } from '../src/lib/db';

async function main() {
  const query = process.argv.slice(2).join(' ').trim();
  if (!query) {
    console.log('\nUsage: npm run sql "<SQL_STATEMENT>"');
    console.log('Examples:');
    console.log('  npm run sql "SELECT * FROM users"');
    console.log('  npm run sql "SELECT name, price, stock FROM products LIMIT 5"');
    console.log('  npm run sql "SELECT name, email, role FROM users"\n');
    process.exit(0);
  }

  const db = await getDb();
  const lower = query.toLowerCase();

  if (lower.startsWith('select') || lower.startsWith('pragma')) {
    const rows = await db.prepare(query).all();
    if (rows.length === 0) {
      console.log('(0 rows returned)');
    } else {
      console.table(rows);
    }
  } else {
    const result = await db.prepare(query).run();
    console.log('Statement executed successfully.');
    console.log(result);
  }
}

main().catch((err) => {
  console.error('SQL Error:', err.message || err);
  process.exit(1);
});

