import { getDb } from '../src/lib/db';

async function showDb() {
  const db = await getDb();
  
  const tables = ['users', 'categories', 'products', 'product_variants', 'orders', 'order_items'];
  console.log('\n================ DATABASE TABLES OVERVIEW ================');
  for (const t of tables) {
    const row = await db.prepare(`SELECT COUNT(*) as count FROM ${t}`).get();
    console.log(`- ${t.padEnd(18)}: ${(row as any).count} record(s)`);
  }

  console.log('\n================ USERS IN DATABASE ================');
  const users = await db.prepare('SELECT id, name, email, role, createdAt FROM users').all();
  console.table(users);

  console.log('\n================ CATEGORIES ================');
  const categories = await db.prepare('SELECT id, name, slug, icon FROM categories').all();
  console.table(categories);

  console.log('\n================ SAMPLE PRODUCTS (FIRST 6) ================');
  const products = await db.prepare('SELECT id, name, price, stock, categoryId FROM products LIMIT 6').all();
  console.table(products);

  console.log('\n================ ORDERS ================');
  const orders = await db.prepare('SELECT id, userId, status, total, paymentMethod, createdAt FROM orders').all();
  if (orders.length === 0) {
    console.log('(No orders placed yet)');
  } else {
    console.table(orders);
  }
}

showDb().catch(console.error);

