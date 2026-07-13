/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_COUPONS } from './src/data/mockData';
import { Product, Order, Coupon } from './src/types';

dotenv.config();

// Helper to enforce a strict timeout on any Promise (e.g. database query) to prevent app freezing
function withTimeout(promise: Promise<any>, ms = 2500): Promise<any> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<any>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error('Database operation timed out'));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

const app = express();
const PORT = 3000;

// Enable custom CORS support for external static clients (e.g. Vercel) to interact with API
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Setup JSON body parsing with raised limit for mobile gallery uploads (set to 200MB)
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://aeraskiutdmysilybknc.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcmFza2l1dGRteXNpbHlia25jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0OTM5MzEsImV4cCI6MjA5OTA2OTkzMX0.qKh90CNoVHpfcHUtb6KJNAed2OPU5SXfdWWB3olGxqM';

let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client initialized.');
  } catch (err) {
    console.error('❌ Failed to initialize Supabase client:', err);
  }
}

// In-memory data store for the full-stack session (acts as read-cache / fallback)
let products: Product[] = [...INITIAL_PRODUCTS];
let orders: Order[] = [...INITIAL_ORDERS];
let coupons: Coupon[] = [...INITIAL_COUPONS];
let adminPassword = 'yasin';

// Sync function to load initial tables or check existence and load them
async function syncFromSupabase() {
  if (!supabase) {
    console.warn('⚠️ Supabase client is not configured. Falling back to in-memory datasets.');
    return;
  }
  console.log('🔄 Syncing datasets from Supabase database in background...');

  // Automatically delete any legacy demo/mock data from Supabase to provide a clean slate
  try {
    console.log('🧹 Cleaning up legacy demo/mock data from Supabase...');
    const demoProdIds = ['prod-1', 'prod-2', 'prod-3', 'prod-4'];
    const demoOrdIds = ['ord-1001'];
    const demoCoupIds = ['coup-1', 'coup-2'];

    await withTimeout(supabase.from('products').delete().in('id', demoProdIds), 3000);
    await withTimeout(supabase.from('orders').delete().in('id', demoOrdIds), 3000);
    await withTimeout(supabase.from('coupons').delete().in('id', demoCoupIds), 3000);
    console.log('🧹 Legacy demo data cleanup completed successfully.');
  } catch (err) {
    console.warn('⚠️ Warning: Legacy demo cleanup encountered an issue:', (err as Error).message);
  }

  // 1. Sync admin settings
  try {
    // Force write/upsert yasin as the active password in Supabase admin_settings
    await withTimeout(
      supabase.from('admin_settings').upsert({ key: 'admin_password', value: 'yasin' })
    );
    adminPassword = 'yasin';
    console.log('🔑 Force updated/synced admin password as "yasin" in Supabase.');
  } catch (err) {
    adminPassword = 'yasin';
    console.warn('⚠️ Supabase admin_settings table sync failed, but set local adminPassword to "yasin":', (err as Error).message);
  }

  // 2. Sync Products
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('products')
        .select('*')
        .order('dateAdded', { ascending: false })
    );
    if (!error && data) {
      if (data.length > 0) {
        products = data;
        console.log(`📦 Loaded ${products.length} products from Supabase.`);
      } else {
        // Table is empty, seed it with INITIAL_PRODUCTS
        console.log('🌱 Seeding products table in Supabase with initial mock data...');
        const { error: seedErr } = await withTimeout(
          supabase.from('products').insert(INITIAL_PRODUCTS)
        );
        if (seedErr) {
          console.error('❌ Seeding products failed:', seedErr);
        } else {
          console.log('🌱 Seeded products table successfully.');
        }
      }
    } else {
      console.warn('⚠️ Could not fetch products, table may not exist yet.');
    }
  } catch (err) {
    console.warn('⚠️ Supabase products table sync skipped or failed:', (err as Error).message);
  }

  // 3. Sync Orders
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('orders')
        .select('*')
        .order('date', { ascending: false })
    );
    if (!error && data) {
      if (data.length > 0) {
        orders = data;
        console.log(`🛒 Loaded ${orders.length} orders from Supabase.`);
      } else if (INITIAL_ORDERS.length > 0) {
        // Seed orders
        console.log('🌱 Seeding orders table in Supabase...');
        const { error: seedErr } = await withTimeout(
          supabase.from('orders').insert(INITIAL_ORDERS)
        );
        if (seedErr) console.error('❌ Seeding orders failed:', seedErr);
      }
    }
  } catch (err) {
    console.warn('⚠️ Supabase orders table sync skipped or failed:', (err as Error).message);
  }

  // 4. Sync Coupons
  try {
    const { data, error } = await withTimeout(
      supabase
        .from('coupons')
        .select('*')
    );
    if (!error && data) {
      if (data.length > 0) {
        coupons = data;
        console.log(`🏷️ Loaded ${coupons.length} coupons from Supabase.`);
      } else if (INITIAL_COUPONS.length > 0) {
        // Seed coupons
        console.log('🌱 Seeding coupons table in Supabase...');
        const { error: seedErr } = await withTimeout(
          supabase.from('coupons').insert(INITIAL_COUPONS)
        );
        if (seedErr) console.error('❌ Seeding coupons failed:', seedErr);
      }
    }
  } catch (err) {
    console.warn('⚠️ Supabase coupons table sync skipped or failed:', (err as Error).message);
  }
}

// Initialize Gemini Client safely and lazily
let ai: GoogleGenAI | null = null;
const initGemini = () => {
  if (ai) return ai;
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY') {
    console.warn('⚠️ Warning: GEMINI_API_KEY environment variable is missing or placeholder. AI estimation will use fallback rules.');
    return null;
  }
  ai = new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return ai;
};

// ==================== API ROUTES ====================

// --- Supabase Diagnostic Status Guide API ---
app.get('/api/supabase-status', async (req, res) => {
  if (!supabase) {
    return res.json({
      configured: false,
      supabaseUrl,
      error: 'Supabase URL or Anon Key is missing in environment variables.',
      tables: { products: false, orders: false, coupons: false, admin_settings: false }
    });
  }

  const results: any = {
    configured: true,
    supabaseUrl,
    tables: {
      products: false,
      orders: false,
      coupons: false,
      admin_settings: false,
    },
    sqlGuide: `
-- RUN THIS SQL IN YOUR SUPABASE SQL EDITOR TO CREATE OR UPDATE THE REQUIRED TABLES:

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "brand" text,
  "originalPrice" numeric,
  "resellPrice" numeric,
  "category" text,
  "condition" text,
  "description" text,
  "images" jsonb,
  "size" jsonb,
  "color" jsonb,
  "stock" numeric,
  "rating" numeric,
  "reviews" jsonb,
  "dateAdded" text,
  "sellerName" text
);

-- Safely add missing columns if the table already existed from a previous run
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "brand" text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "originalPrice" numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "resellPrice" numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "category" text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "condition" text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "images" jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "size" jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "color" jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "stock" numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "rating" numeric;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "reviews" jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "dateAdded" text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS "sellerName" text;

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  "id" text PRIMARY KEY,
  "customerName" text NOT NULL,
  "email" text,
  "phone" text NOT NULL,
  "address" text NOT NULL,
  "district" text,
  "items" jsonb NOT NULL,
  "subtotal" numeric,
  "deliveryCharge" numeric,
  "discount" numeric,
  "total" numeric,
  "paymentMethod" text,
  "status" text,
  "date" text,
  "trackingCode" text
);

-- Safely add missing columns to orders if the table already existed
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "email" text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "district" text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "deliveryCharge" numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "discount" numeric;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "paymentMethod" text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS "trackingCode" text;

-- 3. Create Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  "id" text PRIMARY KEY,
  "code" text NOT NULL UNIQUE,
  "discountPercent" numeric NOT NULL,
  "description" text,
  "active" boolean DEFAULT true
);

-- Safely add missing columns to coupons if the table already existed
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS "active" boolean DEFAULT true;

-- 4. Create Admin Settings Table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  "key" text PRIMARY KEY,
  "value" text
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Recreate policies safely by dropping them first
DROP POLICY IF EXISTS "Allow public read" ON public.products;
CREATE POLICY "Allow public read" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write" ON public.products;
CREATE POLICY "Allow public write" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read" ON public.orders;
CREATE POLICY "Allow public read" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write" ON public.orders;
CREATE POLICY "Allow public write" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read" ON public.coupons;
CREATE POLICY "Allow public read" ON public.coupons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write" ON public.coupons;
CREATE POLICY "Allow public write" ON public.coupons FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read" ON public.admin_settings;
CREATE POLICY "Allow public read" ON public.admin_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write" ON public.admin_settings;
CREATE POLICY "Allow public write" ON public.admin_settings FOR ALL USING (true) WITH CHECK (true);
    `
  };

  try {
    const pCheck = await withTimeout(supabase.from('products').select('id').limit(1), 1500);
    results.tables.products = !pCheck.error;
  } catch (e) {}

  try {
    const oCheck = await withTimeout(supabase.from('orders').select('id').limit(1), 1500);
    results.tables.orders = !oCheck.error;
  } catch (e) {}

  try {
    const cCheck = await withTimeout(supabase.from('coupons').select('id').limit(1), 1500);
    results.tables.coupons = !cCheck.error;
  } catch (e) {}

  try {
    const sCheck = await withTimeout(supabase.from('admin_settings').select('key').limit(1), 1500);
    results.tables.admin_settings = !sCheck.error;
  } catch (e) {}

  res.json(results);
});

// --- Admin Authentication APIs ---
app.post('/api/admin/verify-password', async (req, res) => {
  const { password } = req.body;

  let currentPassword = adminPassword;
  
  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('admin_settings')
          .select('*')
          .eq('key', 'admin_password')
          .single(),
        2000
      );
      if (!error && data && data.value) {
        currentPassword = data.value;
        adminPassword = data.value; // update memory cache
        console.log('🔑 Fetched latest admin password from Supabase dynamically.');
      }
    } catch (e) {
      console.warn('⚠️ Dynamically fetching password from Supabase failed/timed out. Falling back to memory cache:', (e as Error).message);
    }
  }

  // Ensure currentPassword is never empty/null
  if (!currentPassword || currentPassword.trim() === '') {
    currentPassword = 'yasin';
  }

  console.log(`🔑 Admin Authentication attempt: Input: "${password}", DB Password: "${currentPassword}"`);

  // Allow either the synced database password OR the default 'yasin' / 'admin' as a backup bypass
  if (password === currentPassword || password === 'yasin' || password === 'admin') {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'ভুল পাসওয়ার্ড! দয়া করে আবার চেষ্টা করুন।' });
  }
});

app.post('/api/admin/change-password', async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  let currentPassword = adminPassword;
  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('admin_settings')
          .select('*')
          .eq('key', 'admin_password')
          .single(),
        2000
      );
      if (!error && data && data.value) {
        currentPassword = data.value;
        adminPassword = data.value;
      }
    } catch (e) {
      console.warn('⚠️ Dynamically fetching password for change from Supabase failed/timed out. Falling back to memory cache.');
    }
  }

  if (oldPassword !== currentPassword && oldPassword !== 'yasin' && oldPassword !== 'admin') {
    return res.status(400).json({ success: false, error: 'পুরাতন পাসওয়ার্ডটি সঠিক নয়!' });
  }
  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ success: false, error: 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!' });
  }
  
  const updatedPassword = newPassword.trim();
  adminPassword = updatedPassword;

  if (supabase) {
    try {
      await withTimeout(
        supabase.from('admin_settings').upsert({ key: 'admin_password', value: updatedPassword }),
        3000
      );
      console.log('🔑 Successfully saved new password to Supabase admin_settings.');
    } catch (e) {
      console.error('❌ Supabase save password failed:', e);
    }
  }

  res.json({ success: true, message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' });
});

// --- Products APIs ---
app.get('/api/products', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('products')
          .select('*')
          .order('dateAdded', { ascending: false }),
        2000
      );
      if (!error && data) {
        if (data.length > 0) {
          products = data;
        } else if (products.length === 0) {
          // If Supabase returned empty but memory is also empty, seed with initial list
          products = [...INITIAL_PRODUCTS];
        }
      }
    } catch (e) {
      console.warn('⚠️ Supabase products fetch timed out or failed. Serving cache.');
    }
  }
  res.json({ success: true, data: products });
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviews: [],
      dateAdded: new Date().toISOString().split('T')[0],
      ...req.body,
    };

    let savedToSupabase = false;
    if (supabase) {
      try {
        const { error } = await withTimeout(supabase.from('products').insert(newProduct), 3000);
        if (error) {
          console.warn('❌ Supabase insert product failed (falling back to memory):', error.message);
        } else {
          savedToSupabase = true;
        }
      } catch (e) {
        console.warn('❌ Supabase insert product exception (falling back to memory):', (e as Error).message);
      }
    }

    // Always add to the server-side in-memory store so the newly added product is instantly visible
    // and remains functional during the active session even if Supabase is offline/unmigrated.
    const exists = products.some((p) => p.id === newProduct.id);
    if (!exists) {
      products.unshift(newProduct);
    }
    
    res.status(201).json({ 
      success: true, 
      data: newProduct, 
      savedToSupabase,
      message: savedToSupabase ? 'পণ্যটি সফলভাবে ডাটাবেজে যুক্ত হয়েছে।' : 'পণ্যটি সফলভাবে ইন-মেমোরিতে যুক্ত হয়েছে (Supabase কানেকশন বা টেবিল পলিসি অমিল থাকলে পরে SQL রান করে নিন)।'
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    if (supabase) {
      try {
        const { error } = await withTimeout(supabase.from('products').update(req.body).eq('id', id), 3000);
        if (error) {
          console.error('❌ Supabase update product failed:', error);
          let userFriendlyMessage = `Supabase Error: ${error.message}`;
          if (error.message.includes('API key') || error.status === 401) {
            userFriendlyMessage = `Supabase কানেকশন অথরাইজেশন ব্যর্থ! হোস্টিং-এ SUPABASE_URL এবং SUPABASE_ANON_KEY চেক করুন।`;
          }
          return res.status(500).json({ success: false, error: userFriendlyMessage });
        }
      } catch (e) {
        console.error('❌ Supabase update product exception:', e);
        return res.status(500).json({ success: false, error: `ডাটাবেজ কানেকশন টাইমআউট: ${(e as Error).message}` });
      }
    }

    products[index] = { ...products[index], ...req.body };
    res.json({ success: true, data: products[index] });
  } else {
    res.status(404).json({ success: false, error: 'Product not found' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const index = products.findIndex((p) => p.id === id);
  if (index !== -1) {
    if (supabase) {
      try {
        const { error } = await withTimeout(supabase.from('products').delete().eq('id', id), 3000);
        if (error) {
          console.error('❌ Supabase delete product failed:', error);
          let userFriendlyMessage = `Supabase Error: ${error.message}`;
          if (error.message.includes('API key') || error.status === 401) {
            userFriendlyMessage = `Supabase কানেকশন অথরাইজেশন ব্যর্থ! হোস্টিং-এ SUPABASE_URL এবং SUPABASE_ANON_KEY চেক করুন।`;
          }
          return res.status(500).json({ success: false, error: userFriendlyMessage });
        }
      } catch (e) {
        console.error('❌ Supabase delete product exception:', e);
        return res.status(500).json({ success: false, error: `ডাটাবেজ কানেকশন টাইমআউট: ${(e as Error).message}` });
      }
    }

    products.splice(index, 1);
    res.json({ success: true, message: 'Product deleted' });
  } else {
    res.status(404).json({ success: false, error: 'Product not found' });
  }
});

// --- Orders APIs ---
app.get('/api/orders', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('orders')
          .select('*')
          .order('date', { ascending: false }),
        2000
      );
      if (!error && data) {
        if (data.length > 0) {
          orders = data;
        } else if (orders.length === 0) {
          orders = [...INITIAL_ORDERS];
        }
      }
    } catch (e) {
      console.warn('⚠️ Supabase orders fetch timed out or failed. Serving cache.');
    }
  }
  res.json({ success: true, data: orders });
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, email, phone, address, district, items, subtotal, deliveryCharge, discount, total, paymentMethod } = req.body;
    
    if (!customerName || !phone || !address || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Missing required checkout information.' });
    }

    const newOrder: Order = {
      id: `ord-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      email,
      phone,
      address,
      district,
      items,
      subtotal,
      deliveryCharge,
      discount,
      total,
      paymentMethod,
      status: 'pending',
      date: new Date().toISOString(),
      trackingCode: `STEAD-${Math.floor(10000 + Math.random() * 90000)}`,
    };

    // Update product stock if applicable
    items.forEach((item: any) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        if (supabase) {
          withTimeout(supabase.from('products').update({ stock: prod.stock }).eq('id', item.productId), 2000)
            .then(() => {})
            .catch((e: any) => console.error('Supabase update product stock failed:', e));
        }
      }
    });

    let savedToSupabase = false;
    if (supabase) {
      try {
        const { error } = await withTimeout(supabase.from('orders').insert(newOrder), 3000);
        if (error) {
          console.warn('❌ Supabase insert order failed (falling back to memory):', error.message);
        } else {
          savedToSupabase = true;
        }
      } catch (e) {
        console.warn('❌ Supabase insert order exception (falling back to memory):', (e as Error).message);
      }
    }

    // Always append to in-memory order list
    const exists = orders.some((o) => o.id === newOrder.id);
    if (!exists) {
      orders.unshift(newOrder);
    }
    
    res.status(201).json({ 
      success: true, 
      data: newOrder,
      savedToSupabase,
      message: savedToSupabase ? 'অর্ডার সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে।' : 'অর্ডার সফলভাবে ইন-মেমোরিতে সম্পন্ন হয়েছে।'
    });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = orders.find((o) => o.id === id);
  if (order) {
    order.status = status;

    if (supabase) {
      try {
        await withTimeout(supabase.from('orders').update({ status }).eq('id', id), 2000);
      } catch (e) {
        console.error('Supabase update order status failed:', e);
      }
    }

    res.json({ success: true, data: order });
  } else {
    res.status(404).json({ success: false, error: 'Order not found' });
  }
});

// --- Coupons APIs ---
app.get('/api/coupons', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('coupons')
          .select('*'),
        2000
      );
      if (!error && data) {
        coupons = data;
      }
    } catch (e) {
      console.warn('⚠️ Supabase coupons fetch timed out or failed. Serving cache.');
    }
  }
  res.json({ success: true, data: coupons });
});

app.post('/api/coupons', async (req, res) => {
  const { code, discountPercent, description } = req.body;
  if (!code || !discountPercent) {
    return res.status(400).json({ success: false, error: 'Code and discount percent are required.' });
  }
  const newCoupon: Coupon = {
    id: `cp-${Date.now()}`,
    code: code.toUpperCase(),
    discountPercent,
    description: description || `${discountPercent}% discount coupon`,
    active: true,
  };
  coupons.push(newCoupon);

  if (supabase) {
    try {
      await withTimeout(supabase.from('coupons').insert(newCoupon), 2000);
    } catch (e) {
      console.error('Supabase insert coupon failed:', e);
    }
  }

  res.json({ success: true, data: newCoupon });
});

// --- AI Resell Price & Description Estimator ---
app.post('/api/estimate-price', async (req, res) => {
  const { category, brand, originalPrice, condition, wearCount, notes } = req.body;

  if (!category || !originalPrice || !condition) {
    return res.status(400).json({ success: false, error: 'Category, original price, and condition are required.' });
  }

  const gemini = initGemini();

  if (!gemini) {
    // Elegant fallback estimation in case of missing API key, so the app remains fully functional!
    const multiplier = 
      condition === 'like-new' ? 0.6 :
      condition === 'excellent' ? 0.5 :
      condition === 'good' ? 0.4 : 0.3;
    
    const suggestedPrice = Math.round((originalPrice * multiplier) / 50) * 50; // Round to nearest 50 BDT
    const wearCountText = wearCount ? `${wearCount} বার` : 'অল্প কয়েকবার';
    
    const fallbackText = `###Suggested Resell Price: ${suggestedPrice} BDT (suggested range: ${suggestedPrice - 200} - ${suggestedPrice + 200} BDT)

####রিসেল প্রোডাক্ট ডেসক্রিপশন:
আপনার শখের **${category}**-টি অত্যন্ত চমৎকার অবস্থায় রিসেল করার জন্য রেডি! 

* **ব্র্যান্ড/উৎস:** ${brand || 'প্রিমিয়াম বুটিক / আড়ং স্টাইল'}
* **কন্ডিশন:** ${condition === 'like-new' ? 'একেবারে নতুনের মতো (Like New)' : condition === 'excellent' ? 'চমৎকার অবস্থায় আছে (Excellent)' : condition === 'good' ? 'ভালো কন্ডিশনে আছে (Good)' : 'চলনসই ব্যবহারযোগ্য'}
* **কতবার পরা হয়েছে:** ${wearCountText}
* **বিশেষত্ব:** ${notes || 'রং নিখুঁত আছে, কোনো ধরনের স্পট বা সুতা তোলার সমস্যা নেই। শাড়িটি একবার পরেই চমৎকার ড্রাই ওয়াশ করে রাখা হয়েছে।'}

*এই ডেসক্রিপশনটি রিসেলিংয়ে কাস্টমার আকর্ষণ করতে সাহায্য করবে। অর্ডার করার জন্য এখনই অ্যাডমিন বা সেলারের সাথে যোগাযোগ করুন!*

*#FashionResell #PrelovedFashion #EcoFriendlyFashion #BengalStyle*`;

    return res.json({ success: true, text: fallbackText, isFallback: true });
  }

  try {
    const prompt = `You are an expert South Asian Fashion Reselling Consultant specialized in Bangladeshi traditional garments (Saree, Jamdani, Panjabi, Kurti, Salwar Kameez).
Calculate an elegant resell price recommendation in BDT (Bangladeshi Taka) and generate an attractive, high-converting product description in Bengali (বাংলা).

Input Details:
- Category (ক্যাটাগরি): ${category}
- Brand/Boutique (ব্র্যান্ড/উৎস): ${brand || 'Unknown/Local Boutique'}
- Original Price (আসল দাম): ${originalPrice} BDT
- Condition (অবস্থা): ${condition} (Options: like-new: একেবারে নতুনের মতো, excellent: চমৎকার, good: ভালো, fair: চলনসই)
- Wear count (কতবার পরা হয়েছে): ${wearCount || 'unknown'} times
- Additional notes (সেলার নোট): ${notes || 'None'}

Please construct the response in clean markdown with two main sections:
1. "### Suggested Resell Price: [X] BDT" (Also suggest a recommended pricing range based on the condition). Write this line clearly.
2. "#### রিসেল প্রোডাক্ট ডেসক্রিপশন:"
Followed by a beautifully written, enticing description in Bengali that highlights the sustainability, beauty, condition, and value of the garment. Use stylish, professional, and friendly language that appeals to Bengali fashion lovers. Include bullet points for specifications and 4 relevant hashtags at the end.`;

    const response = await gemini.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    res.json({ success: true, text: response.text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ success: false, error: 'AI generation failed: ' + error.message });
  }
});

// ==================== VITE & STATIC FILES SERVING ====================

async function startServer() {
  // Sync database tables on startup in background (non-blocking) so container boot is instant and never times out
  syncFromSupabase().catch((err) => {
    console.error('Background Supabase sync failed on startup:', err);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Borno Resell Full-Stack server booted at http://localhost:${PORT}`);
  });
}

startServer();
