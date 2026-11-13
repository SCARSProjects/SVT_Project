-- ====================================================================
-- ShopMart Database Schema (SQLite / LibSQL)
-- ====================================================================

PRAGMA foreign_keys = ON;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL COLLATE NOCASE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'CUSTOMER',
  image TEXT,
  phone TEXT,
  address TEXT,
  createdAt TEXT NOT NULL
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Package',
  image TEXT
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  compareAtPrice REAL,
  stock INTEGER NOT NULL DEFAULT 0,
  images TEXT NOT NULL,
  rating REAL NOT NULL DEFAULT 4.5,
  reviewCount INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  categoryId TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
);

-- 4. Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  productId TEXT NOT NULL,
  attributeName TEXT NOT NULL,
  value TEXT NOT NULL,
  priceModifier REAL NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  paymentMethod TEXT NOT NULL DEFAULT 'COD',
  total REAL NOT NULL,
  shippingName TEXT NOT NULL,
  shippingPhone TEXT NOT NULL,
  shippingAddress TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  productId TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price REAL NOT NULL,
  variantId TEXT,
  variantLabel TEXT,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE RESTRICT
);

-- Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(categoryId);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(productId);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(userId);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(orderId);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(productId);

