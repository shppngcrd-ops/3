/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, X, Trash2, ShoppingBag, MessageSquare, Mail, MapPin, Phone, 
  RotateCcw, ShieldCheck, Star, HelpCircle, AlertTriangle 
} from 'lucide-react';

import { Product, CartItem, Order, Coupon } from './types';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import { apiFetch } from './utils/api';

export default function App() {
  // Core API States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Client UI States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('সব প্রোডাক্ট');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Email Newsletter subscription
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Long press hold timer states for Admin Unlock
  const [isPressing, setIsPressing] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const [pressTimer, setPressTimer] = useState<any>(null);
  const [progressInterval, setProgressInterval] = useState<any>(null);

  const startPress = (e: React.MouseEvent | React.TouchEvent) => {
    setIsPressing(true);
    setPressProgress(0);
    
    const startTime = Date.now();
    const duration = 2000; // 2 seconds hold time

    const timer = setTimeout(() => {
      setIsPressing(false);
      setPressProgress(0);
      setIsAdmin(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Try to trigger modern haptic vibration if available on mobile browser
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(80);
        } catch (vErr) {
          // ignore silent
        }
      }
    }, duration);

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setPressProgress(pct);
    }, 40);

    setPressTimer(timer);
    setProgressInterval(interval);
  };

  const endPress = () => {
    setIsPressing(false);
    setPressProgress(0);
    if (pressTimer) clearTimeout(pressTimer);
    if (progressInterval) clearInterval(progressInterval);
  };

  // Fetch initial datasets on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setApiError(null);

        const [prodRes, ordRes, coupRes] = await Promise.all([
          apiFetch('/api/products'),
          apiFetch('/api/orders'),
          apiFetch('/api/coupons'),
        ]);

        const [prodData, ordData, coupData] = await Promise.all([
          prodRes.json(),
          ordRes.json(),
          coupRes.json(),
        ]);

        if (prodData.success) setProducts(prodData.data);
        if (ordData.success) setOrders(ordData.data);
        if (coupData.success) setCoupons(coupData.data);
      } catch (err: any) {
        console.error('API Loading Error:', err);
        setApiError('সার্ভার থেকে ডেটা লোড করতে সমস্যা হচ্ছে। দয়া করে পেজটি রিফ্রেশ করুন!');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Sync Cart to localStorage as an extra local persistence layer
  useEffect(() => {
    const savedCart = localStorage.getItem('borno_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.warn('Stale cart localStorage cleared');
      }
    }
  }, []);

  const saveCartToStorage = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('borno_cart', JSON.stringify(newCart));
  };

  // Cart operations
  const handleAddToCart = (product: Product, size?: string, color?: string, qty: number = 1) => {
    const chosenSize = size || product.size[0] || 'Free Size';
    const chosenColor = color || product.color[0] || 'ডিফল্ট';

    const existingIndex = cart.findIndex(
      (item) => 
        item.product.id === product.id && 
        item.selectedSize === chosenSize && 
        item.selectedColor === chosenColor
    );

    let updatedCart = [...cart];
    if (existingIndex !== -1) {
      updatedCart[existingIndex].quantity += qty;
    } else {
      updatedCart.push({
        product,
        quantity: qty,
        selectedSize: chosenSize,
        selectedColor: chosenColor,
      });
    }

    saveCartToStorage(updatedCart);
    setIsCartOpen(true);
  };

  const handleInstantBuy = (product: Product, size?: string, color?: string, qty: number = 1) => {
    handleAddToCart(product, size, color, qty);
  };

  const handleUpdateQuantity = (productId: string, size: string, color: string, newQty: number) => {
    if (newQty < 1) return;
    const updatedCart = cart.map((item) => {
      if (
        item.product.id === productId && 
        item.selectedSize === size && 
        item.selectedColor === color
      ) {
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveCartToStorage(updatedCart);
  };

  const handleRemoveItem = (productId: string, size: string, color: string) => {
    const updatedCart = cart.filter(
      (item) => 
        !(item.product.id === productId && 
          item.selectedSize === size && 
          item.selectedColor === color)
    );
    saveCartToStorage(updatedCart);
  };

  const handleClearCart = () => {
    saveCartToStorage([]);
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product) => {
    const exists = wishlist.some((p) => p.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter((p) => p.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  // Admin APIs Callbacks
  const handleAdminAddProduct = async (prodData: Omit<Product, 'id' | 'rating' | 'reviews' | 'dateAdded'>) => {
    try {
      const response = await apiFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prodData),
      });
      const result = await response.json();
      if (result.success) {
        setProducts([result.data, ...products]);
      }
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const handleAdminEditProduct = async (id: string, updatedFields: Partial<Product>) => {
    try {
      const response = await apiFetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      const result = await response.json();
      if (result.success) {
        setProducts(products.map((p) => (p.id === id ? result.data : p)));
      }
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const handleAdminDeleteProduct = async (id: string) => {
    try {
      const response = await apiFetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const handleAdminUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const response = await apiFetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (result.success) {
        setOrders(orders.map((o) => (o.id === orderId ? result.data : o)));
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handleAdminAddCoupon = async (couponData: Omit<Coupon, 'id' | 'active'>) => {
    try {
      const response = await apiFetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponData),
      });
      const result = await response.json();
      if (result.success) {
        setCoupons([...coupons, result.data]);
      }
    } catch (err) {
      console.error('Error adding coupon:', err);
    }
  };

  // Filters calculation
  const filteredProducts = products.filter((p) => {
    const matchesCategory = 
      selectedCategory === 'সব প্রোডাক্ট' || 
      selectedCategory === '' || 
      p.category === selectedCategory;
    
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FCF9F5] flex flex-col justify-between">
      
      {/* Navbar Integration */}
      <Navbar
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedProduct(null); // Close details view when switching categories
        }}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      {/* Main App Workspace container */}
      <main className="flex-1">
        
        {loading ? (
          /* LOADING SCREEN */
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <span className="w-12 h-12 border-4 border-brand-maroon border-t-brand-gold rounded-full animate-spin" />
            <p className="text-sm font-medium text-brand-charcoal/60 animate-pulse">
              বরণ ফ্যাশন রিসেলিং লোড হচ্ছে। অনুগ্রহ করে অপেক্ষা করুন...
            </p>
          </div>
        ) : apiError ? (
          /* ERROR BOUNDARY DISPLAY */
          <div className="max-w-md mx-auto text-center py-20 px-6 space-y-4">
            <AlertTriangle className="w-14 h-14 mx-auto text-amber-500 animate-bounce" />
            <p className="text-sm font-semibold text-brand-charcoal">{apiError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-brand-maroon hover:bg-brand-terracotta text-white font-bold px-5 py-2.5 rounded-full text-xs shadow"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : isAdmin ? (
          /* ADMIN CONSOLE VIEW */
          <AdminPanel
            products={products}
            orders={orders}
            coupons={coupons}
            onAddProduct={handleAdminAddProduct}
            onEditProduct={handleAdminEditProduct}
            onDeleteProduct={handleAdminDeleteProduct}
            onUpdateOrderStatus={handleAdminUpdateOrderStatus}
            onAddCoupon={handleAdminAddCoupon}
            onExitAdmin={() => setIsAdmin(false)}
          />
        ) : selectedProduct ? (
          /* PRODUCT DETAILS VIEW PAGE */
          <ProductDetail
            product={selectedProduct}
            onBack={() => setSelectedProduct(null)}
            onAddToCart={(prod, sz, col, qty) => handleAddToCart(prod, sz, col, qty)}
            onInstantBuy={(prod, sz, col, qty) => {
              handleInstantBuy(prod, sz, col, qty);
              setIsCartOpen(true);
            }}
            allProducts={products}
            onSelectProduct={(prod) => {
              setSelectedProduct(prod);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        ) : (
          /* STANDARD CUSTOMER FRONT VIEW */
          <div className="space-y-12">
            
            {/* Hero Auto-Slider Banner */}
            <Hero onCategorySelect={(cat) => setSelectedCategory(cat)} />

            {/* Catalog Grid Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-gold/15 pb-4 mb-8 gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  {((selectedCategory && selectedCategory !== 'সব প্রোডাক্ট') || searchQuery) && (
                    <button
                      onClick={() => {
                        setSelectedCategory('সব প্রোডাক্ট');
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-brand-maroon text-[#FCF9F5] hover:bg-brand-terracotta border border-brand-maroon hover:border-brand-terracotta transition-all duration-300 shadow-md animate-fadeIn"
                    >
                      ← ব্যাক করুন (সব প্রোডাক্টে ফিরে যান)
                    </button>
                  )}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-extrabold text-brand-charcoal tracking-tight">
                      {searchQuery ? `সার্চ রেজাল্ট: "${searchQuery}"` : (selectedCategory || 'সব প্রোডাক্ট')}
                    </h2>
                    <p className="text-xs text-brand-charcoal/50 mt-1">
                      আমাদের বরণ রিসেল ক্যাটালগ থেকে সেরা পণ্যটি বেছে নিন।
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-brand-gold/10 text-brand-maroon border border-brand-gold/15 px-3 py-1 rounded-full font-semibold self-start sm:self-auto">
                  মজুদ পণ্য: {filteredProducts.length} টি
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-brand-charcoal/40 text-xs">
                  আপনার অনুসন্ধান বা ক্যাটাগরির সাথে সামঞ্জস্যপূর্ণ কোনো পণ্য পাওয়া যায়নি।
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={(prod) => {
                        setSelectedProduct(prod);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      onAddToCart={(prod) => handleAddToCart(prod)}
                      isWishlisted={wishlist.some((wp) => wp.id === product.id)}
                      onToggleWishlist={(prod) => handleToggleWishlist(prod)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Testimonials Banner Slider */}
            <section className="bg-brand-maroon text-[#FCF9F5] py-16 px-4">
              <div className="max-w-3xl mx-auto text-center space-y-6">
                <h3 className="text-lg uppercase tracking-widest text-brand-gold font-bold">গ্রাহকদের মুখে আমাদের কথা</h3>
                <blockquote className="text-xl sm:text-2xl font-serif font-light italic leading-relaxed">
                  "বরণ ফ্যাশন থেকে লাল বেনারসি কাত্তান শাড়িটি কিনেছিলাম। রিসেল পণ্য হলেও সেলার কন্ডিশন একেবারে শো-রুম নতুনের মতো ছিল! সুতার বুনন নিখুঁত। ধন্যবাদ বরণ রিসেল!"
                </blockquote>
                <div className="space-y-0.5">
                  <div className="font-bold text-sm">নুসরাত ফেরদৌস</div>
                  <div className="text-xs text-[#FCF9F5]/60">ধানমন্ডি, ঢাকা</div>
                </div>
              </div>
            </section>

          </div>
        )}
      </main>

      {/* FOOTER AREA */}
      {!isAdmin && (
        <footer className="bg-white border-t border-brand-gold/15 pt-16 pb-8 text-xs text-brand-charcoal/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            
            {/* Col 1: Borno Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-serif font-extrabold text-brand-maroon">
                বরণ <span className="text-brand-gold font-sans font-medium text-sm ml-0.5 tracking-widest">RESELL</span>
              </h4>
              <p className="leading-relaxed font-light">
                বরণ রিসেল হলো বাংলাদেশের শীর্ষস্থানীয় প্রি-লাভড ও রিসেলিং ফ্যাশন প্ল্যাটফর্ম। দেশীয় ঐতিহ্যবাহী জামদানি, সিল্ক, কাতান ও প্রিমিয়াম খাদি পাঞ্জাবিকে টেকসই উপায়ে নতুন জীবন দিতে কাজ করছি আমরা।
              </p>
              <div className="flex gap-3">
                <span className="p-2 bg-[#FCF9F5] border border-brand-gold/10 rounded-full hover:border-brand-maroon cursor-pointer text-brand-maroon">FB</span>
                <span className="p-2 bg-[#FCF9F5] border border-brand-gold/10 rounded-full hover:border-brand-maroon cursor-pointer text-brand-maroon">IG</span>
                <span className="p-2 bg-[#FCF9F5] border border-brand-gold/10 rounded-full hover:border-brand-maroon cursor-pointer text-brand-maroon">YT</span>
              </div>
            </div>

            {/* Col 2: Categories Shortcuts */}
            <div className="space-y-4">
              <h5 className="font-serif font-bold text-brand-charcoal text-sm uppercase tracking-wider">রিসেল ক্যাটাগরি</h5>
              <ul className="space-y-2.5 font-light">
                {['শাড়ি কালেকশন', 'ডিজাইনার পাঞ্জাবি', 'সালোয়ার কামিজ ও থ্রি-পিস', 'বাচ্চাদের পোশাক', 'টেরাকোটা ও এথনিক গহনা'].map((item) => (
                  <li key={item} className="hover:text-brand-terracotta cursor-pointer transition-colors">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Policy shortcuts */}
            <div className="space-y-4">
              <h5 className="font-serif font-bold text-brand-charcoal text-sm uppercase tracking-wider">গ্রাহক সেবা</h5>
              <ul className="space-y-2.5 font-light">
                {['৭ দিনের সহজ রিটার্ন পলিসি', 'নিরাপদ ক্যাশ অন ডেলিভারি', 'অর্ডার ট্র্যাকিং সিস্টেম', 'ব্যবহৃত পোশাক রিসেল নির্দেশিকা', 'সরাসরি চ্যাট চ্যালাঞ্জ'].map((item) => (
                  <li key={item} className="hover:text-brand-terracotta cursor-pointer transition-colors flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5 text-brand-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Newsletter & Trust badges */}
            <div className="space-y-4">
              <h5 className="font-serif font-bold text-brand-charcoal text-sm uppercase tracking-wider">নিউজলেটার সাবস্ক্রাইব</h5>
              <p className="leading-relaxed font-light">
                নতুন রিসেল ক্যাটালগ আপলোড হওয়া মাত্র নোটিফিকেশন পেতে আমাদের নিউজলেটারে সাবস্ক্রাইব করে রাখুন!
              </p>
              
              {newsletterSuccess ? (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 p-2.5 rounded-xl">
                  ধন্যবাদ! আপনি সফলভাবে যুক্ত হয়েছেন।
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="email"
                    placeholder="আপনার ইমেইল..."
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="bg-[#FCF9F5] border border-brand-gold/25 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2 flex-1"
                  />
                  <button
                    onClick={() => {
                      if (newsletterEmail.trim()) {
                        setNewsletterSuccess(true);
                      }
                    }}
                    className="bg-brand-maroon hover:bg-brand-terracotta text-white font-bold px-4 py-2 rounded-xl"
                  >
                    যুক্ত হোন
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Bottom footer credit */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-brand-gold/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-brand-charcoal/50">
            <p className="select-none text-center sm:text-left">
              © 2026 বরণ ফ্যাশন রিসেল 
              <span 
                onMouseDown={startPress}
                onMouseUp={endPress}
                onMouseLeave={endPress}
                onTouchStart={startPress}
                onTouchEnd={endPress}
                onContextMenu={(e) => e.preventDefault()}
                className={`mx-1 cursor-pointer select-none touch-none inline-block relative text-brand-charcoal/50`}
                style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
              >
                (Borno Resell)
                {isPressing && (
                  <span 
                    className="absolute bottom-0 left-0 h-[1px] bg-brand-maroon/20 rounded-full transition-all duration-75"
                    style={{ width: `${pressProgress}%` }}
                  />
                )}
              </span>
              . সর্বস্বত্ব সংরক্ষিত।
            </p>
            <div className="flex gap-4 font-light">
              <span className="hover:underline cursor-pointer">রিটার্ন পলিসি</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">ব্যবহারের শর্তাবলী</span>
              <span>•</span>
              <span className="hover:underline cursor-pointer">নিরাপদ গেটওয়ে</span>
            </div>
          </div>
        </footer>
      )}

      {/* WISHLIST DRAWER MODAL */}
      {isWishlistOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div onClick={() => setIsWishlistOpen(false)} className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm" />
          <div className="absolute inset-y-0 right-0 w-full sm:w-auto sm:pl-10 max-w-full flex">
            <div className="w-full sm:w-screen sm:max-w-md bg-[#FCF9F5] border-l border-brand-gold/15 shadow-2xl flex flex-col h-full">
              
              <div className="px-5 py-5 border-b border-brand-gold/10 bg-brand-maroon text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5.5 h-5.5 text-brand-gold" fill="currentColor" />
                  <h3 className="text-lg font-serif font-bold">পছন্দের তালিকা (Wishlist)</h3>
                  <span className="bg-brand-gold text-brand-maroon text-xs font-bold px-2 py-0.5 rounded-full">{wishlist.length}</span>
                </div>
                <button 
                  onClick={() => setIsWishlistOpen(false)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-brand-gold text-brand-maroon hover:bg-[#FCF9F5] hover:text-brand-maroon transition-all duration-300 shadow-sm"
                >
                  ← ব্যাক করুন (ফিরে যান)
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
                {wishlist.length === 0 ? (
                  <div className="text-center py-20 text-brand-charcoal/40 space-y-2">
                    <Heart className="w-12 h-12 mx-auto text-brand-gold/40" />
                    <p>আপনার পছন্দের তালিকায় কোনো পণ্য নেই!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-brand-gold/10 space-y-4">
                    {wishlist.map((wp) => (
                      <div key={wp.id} className="flex gap-3.5 pt-4 first:pt-0">
                        <div className="w-14 h-18 rounded-lg overflow-hidden border border-brand-gold/10 flex-shrink-0 bg-brand-cream">
                          <img src={wp.images[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-serif font-bold text-xs text-brand-charcoal">{wp.name}</h4>
                            <span className="text-[10px] text-brand-maroon font-bold">৳{wp.resellPrice.toLocaleString('bn-BD')}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedProduct(wp);
                                setIsWishlistOpen(false);
                              }}
                              className="text-[10px] bg-brand-gold/10 text-brand-maroon border border-brand-gold/25 px-2.5 py-1 rounded-full font-bold"
                            >
                              বিস্তারিত দেখুন
                            </button>
                            <button
                              onClick={() => {
                                handleAddToCart(wp);
                                handleToggleWishlist(wp);
                              }}
                              className="text-[10px] bg-brand-gold text-brand-maroon px-2.5 py-1 rounded-full font-bold shadow-sm"
                            >
                              কার্টে যোগ করুন
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* CARTS integration */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        activeCoupons={coupons}
        onOrderCompleted={(newOrder) => {
          setOrders([newOrder, ...orders]);
        }}
        onClearCart={handleClearCart}
      />

      {/* FLOATING WHATSAPP CHAT BUTTON */}
      <a 
        href="https://wa.me/8801712345678" 
        target="_blank" 
        referrerPolicy="no-referrer"
        className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl transition-transform duration-300 hover:scale-110 flex items-center justify-center border border-emerald-400 group"
        title="WhatsApp-এ চ্যাট করুন"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold pl-0 group-hover:pl-2">
          WhatsApp চ্যাট
        </span>
      </a>

    </div>
  );
}
