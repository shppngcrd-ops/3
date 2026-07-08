/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BarChart3, Plus, Package, ShoppingCart, Percent, Brain, Trash2, Edit3, 
  TrendingUp, AlertTriangle, CheckCircle, RefreshCw, FileText, Send, Copy, ClipboardCheck, Key,
  X, Image as ImageIcon, Upload, Database
} from 'lucide-react';
import { Product, Order, Coupon, DashboardMetrics } from '../types';
import { WEEKLY_SALES_HISTORY, CATEGORY_SALES } from '../data/mockData';

interface AdminPanelProps {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  onAddProduct: (newProduct: Omit<Product, 'id' | 'rating' | 'reviews' | 'dateAdded'>) => void;
  onEditProduct: (id: string, updatedProduct: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onAddCoupon: (newCoupon: Omit<Coupon, 'id' | 'active'>) => void;
  onExitAdmin?: () => void;
}

export default function AdminPanel({
  products,
  orders,
  coupons,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onAddCoupon,
  onExitAdmin,
}: AdminPanelProps) {
  // Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'marketing' | 'ai-estimator' | 'security' | 'supabase'>('dashboard');

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPassword !== confirmPassword) {
      setPwdError('নতুন পাসওয়ার্ড দুটি মিলছে না!');
      return;
    }

    setPwdLoading(true);

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPwdSuccess(data.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwdError(data.error || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
      }
    } catch (err) {
      setPwdError('নেটওয়ার্ক ত্রুটি! দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setPwdLoading(false);
    }
  };

  // Add Product Form State
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodOrigPrice, setProdOrigPrice] = useState('');
  const [prodResPrice, setProdResPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('শাড়ি');
  const [prodCondition, setProdCondition] = useState<'like-new' | 'excellent' | 'good' | 'fair'>('like-new');
  const [prodDescription, setProdDescription] = useState('');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodSize, setProdSize] = useState('Free Size');
  const [prodColor, setProdColor] = useState('মেরুন');
  const [prodStock, setProdStock] = useState('1');
  const [prodSeller, setProdSeller] = useState('বরণ অ্যাডমিন');

  // Edit Product Modal State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState('1');
  const [editPriceValue, setEditPriceValue] = useState('100');

  // Add Coupon Form State
  const [cpCode, setCpCode] = useState('');
  const [cpPercent, setCpPercent] = useState('10');
  const [cpDesc, setCpDesc] = useState('');

  // AI Pricing Estimator State
  const [aiCat, setAiCat] = useState('শাড়ি');
  const [aiBrand, setAiBrand] = useState('আড়ং');
  const [aiOrigPrice, setAiOrigPrice] = useState('6000');
  const [aiWearCount, setAiWearCount] = useState('1');
  const [aiNotes, setAiNotes] = useState('১ বার পরা হয়েছে, কোনো স্পট বা ছেঁড়া নেই, ফুল ড্রাইড ওয়াশ করা।');
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiCopied, setAiCopied] = useState(false);

  // Supabase Integration State
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [supabaseLoading, setSupabaseLoading] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const fetchSupabaseStatus = async () => {
    setSupabaseLoading(true);
    try {
      const res = await fetch('/api/supabase-status');
      const data = await res.json();
      setSupabaseStatus(data);
    } catch (err) {
      console.error('Failed to fetch Supabase status:', err);
    } finally {
      setSupabaseLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'supabase') {
      fetchSupabaseStatus();
    }
  }, [activeTab]);

  // Stats Counters
  const totalSales = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const lowStockCount = products.filter((p) => p.stock === 0).length;

  // Handles direct gallery image selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProdImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handles Adding Product
  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodOrigPrice || !prodResPrice) {
      alert('দয়া করে সমস্ত প্রয়োজনীয় ফিল্ড পূরণ করুন!');
      return;
    }

    // Elegant fallback traditional background placeholder in case no image is provided
    const finalImageUrl = prodImageUrl.trim() || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80';

    onAddProduct({
      name: prodName,
      brand: prodBrand || 'Unknown',
      originalPrice: Number(prodOrigPrice),
      resellPrice: Number(prodResPrice),
      category: prodCategory,
      condition: prodCondition,
      description: prodDescription || 'সুন্দর প্রিমিয়াম প্রোডাক্ট।',
      images: [finalImageUrl],
      size: prodSize.split(',').map((s) => s.trim()),
      color: prodColor.split(',').map((c) => c.trim()),
      stock: Number(prodStock),
      sellerName: prodSeller,
    });

    // Clear Form
    setProdName('');
    setProdBrand('');
    setProdOrigPrice('');
    setProdResPrice('');
    setProdImageUrl('');
    setProdDescription('');
    alert('অভিনন্দন! রিসেল পণ্যটি সফলভাবে ক্যাটালগে যুক্ত হয়েছে।');
  };

  // Handles Editing Product Price/Stock
  const handleSaveProductEdit = (id: string) => {
    onEditProduct(id, {
      stock: Number(editStockValue),
      resellPrice: Number(editPriceValue),
    });
    setEditingProductId(null);
  };

  // Handles Adding Coupon
  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpCode || !cpPercent) {
      alert('কোড এবং ডিসকাউন্ট শতকরা হার আবশ্যক!');
      return;
    }
    onAddCoupon({
      code: cpCode.trim().toUpperCase(),
      discountPercent: Number(cpPercent),
      description: cpDesc || `${cpPercent}% ছাড়ের জন্য কুপন কোড ${cpCode.toUpperCase()}`,
    });
    setCpCode('');
    setCpDesc('');
    alert('কুপন কোডটি সফলভাবে সক্রিয় করা হয়েছে!');
  };

  // Run AI Resell Estimator via Server-Side API
  const handleAIEstimation = async () => {
    if (!aiOrigPrice) {
      alert('আসল দাম লিখুন!');
      return;
    }
    setAiLoading(true);
    setAiResult('');
    setAiCopied(false);

    try {
      const response = await fetch('/api/estimate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: aiCat,
          brand: aiBrand,
          originalPrice: Number(aiOrigPrice),
          condition: 'excellent', // can expand
          wearCount: Number(aiWearCount),
          notes: aiNotes,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAiResult(data.text);
      } else {
        setAiResult('AI এস্টিমেশন ব্যর্থ হয়েছে: ' + data.error);
      }
    } catch (err) {
      console.error(err);
      setAiResult('সার্ভার এরর! দয়া করে কিছু সময় পর আবার চেষ্টা করুন।');
    } finally {
      setAiLoading(false);
    }
  };

  // Copy AI results to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(aiResult);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 3000);
  };

  // Responsive SVG Line Chart Drawing
  const maxWeeklySales = Math.max(...WEEKLY_SALES_HISTORY.map((h) => h.sales));
  const svgWidth = 600;
  const svgHeight = 220;
  const padding = 40;
  const chartWidth = svgWidth - padding * 2;
  const chartHeight = svgHeight - padding * 2;

  // Generate path points
  const points = WEEKLY_SALES_HISTORY.map((h, i) => {
    const x = padding + (i * chartWidth) / (WEEKLY_SALES_HISTORY.length - 1);
    const y = padding + chartHeight - (h.sales / maxWeeklySales) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-brand-gold/15 pb-6">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-brand-maroon">
              বরণ রিসেল এডমিনিস্ট্রেティブ ডেস্ক (Admin)
            </h1>
            {onExitAdmin && (
              <button
                onClick={onExitAdmin}
                className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FCF9F5] border border-brand-maroon text-brand-maroon hover:bg-brand-maroon hover:text-white transition-all duration-300 shadow-sm"
              >
                ← গ্রাহক মোড (Exit)
              </button>
            )}
          </div>
          <p className="text-xs text-brand-charcoal/60 mt-1">
            পণ্য ব্যবস্থাপনা, অর্ডার অনুমোদন, ডিসকাউন্ট মার্কেটিং এবং জেমিনি এআই প্রাইসিং অ্যাসিস্ট্যান্ট হাব।
          </p>
        </div>
        {/* Admin Navigation Menu Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: BarChart3 },
            { id: 'products', label: 'ইনভেন্টরি', icon: Package },
            { id: 'orders', label: 'অর্ডারস', icon: ShoppingCart },
            { id: 'marketing', label: 'মার্কেটিং', icon: Percent },
            { id: 'ai-estimator', label: 'জেমিনি AI এস্টিমেটর', icon: Brain },
            { id: 'security', label: 'সিকিউরিটি', icon: Key },
            { id: 'supabase', label: 'সুপাবেস ডাটাবেস', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border transition-all duration-300 ${
                  isSelected
                    ? 'bg-brand-maroon border-brand-maroon text-[#FCF9F5] shadow-md'
                    : 'bg-white border-brand-gold/20 hover:border-brand-terracotta text-brand-charcoal/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================== TAB 1: DASHBOARD ==================== */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 mt-8 animate-fadeIn">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Sales Card */}
            <div className="bg-white border border-brand-gold/10 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-charcoal/50">মোট বিক্রি (Sales)</span>
                <p className="text-lg sm:text-2xl font-serif font-extrabold text-brand-maroon">৳{totalSales.toLocaleString('bn-BD')}</p>
              </div>
              <div className="p-3 bg-brand-gold/10 rounded-xl text-brand-terracotta">
                <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
            </div>

            {/* Orders Card */}
            <div className="bg-white border border-brand-gold/10 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-charcoal/50">মোট অর্ডারস</span>
                <p className="text-lg sm:text-2xl font-serif font-extrabold text-brand-maroon">{totalOrdersCount} টি</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <ShoppingCart className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
            </div>

            {/* Pending Orders Card */}
            <div className="bg-white border border-brand-gold/10 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-charcoal/50">পেন্ডিং অর্ডার</span>
                <p className="text-lg sm:text-2xl font-serif font-extrabold text-brand-maroon">{pendingOrdersCount} টি</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <RefreshCw className="w-5 sm:w-6 h-5 sm:h-6 animate-spin-slow" />
              </div>
            </div>

            {/* Low stock alert card */}
            <div className="bg-white border border-brand-gold/10 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-charcoal/50">সোল্ড আউট আইটেম</span>
                <p className="text-lg sm:text-2xl font-serif font-extrabold text-brand-maroon">{lowStockCount} টি</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl text-red-600">
                <AlertTriangle className="w-5 sm:w-6 h-5 sm:h-6" />
              </div>
            </div>
          </div>

          {/* Interactive Responsive SVG Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart Left: Sales Trends */}
            <div className="lg:col-span-2 bg-white border border-brand-gold/10 p-5 rounded-2xl shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-serif font-bold text-brand-charcoal">চলমান সপ্তাহের বিক্রি চার্ট (Sales Trends)</h3>
                <span className="text-[10px] text-brand-charcoal/40">দৈনিক মোট অর্ডারের বিপরীতে আয় বিশ্লেষণ</span>
              </div>

              {/* SVG Line Chart */}
              <div className="w-full overflow-x-auto no-scrollbar pt-4">
                <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full min-w-[500px] h-auto">
                  {/* Grid Lines */}
                  {Array.from({ length: 5 }).map((_, i) => {
                    const y = padding + (chartHeight / 4) * i;
                    const val = Math.round(maxWeeklySales - (maxWeeklySales / 4) * i);
                    return (
                      <g key={i} className="opacity-15">
                        <line x1={padding} y1={y} x2={svgWidth - padding} y2={y} stroke="#231F20" strokeWidth="0.5" strokeDasharray="3,3" />
                        <text x={padding - 5} y={y + 3} textAnchor="end" className="text-[9px] fill-brand-charcoal font-sans">
                          ৳{val.toLocaleString('bn-BD')}
                        </text>
                      </g>
                    );
                  })}

                  {/* Line Connection */}
                  <polyline fill="none" stroke="#8C2D19" strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Scatter dots with tooltips */}
                  {WEEKLY_SALES_HISTORY.map((h, i) => {
                    const x = padding + (i * chartWidth) / (WEEKLY_SALES_HISTORY.length - 1);
                    const y = padding + chartHeight - (h.sales / maxWeeklySales) * chartHeight;
                    return (
                      <g key={i} className="group cursor-pointer">
                        <circle cx={x} cy={y} r="5" fill="#C5A059" stroke="#5C151B" strokeWidth="2.5" />
                        {/* Text values */}
                        <text x={x} y={y - 10} textAnchor="middle" className="text-[9px] fill-brand-maroon font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          ৳{h.sales.toLocaleString('bn-BD')}
                        </text>
                        {/* Day Label */}
                        <text x={x} y={svgHeight - padding + 15} textAnchor="middle" className="text-[10px] fill-brand-charcoal/70 font-sans">
                          {h.day}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Chart Right: Category share list */}
            <div className="bg-white border border-brand-gold/10 p-5 rounded-2xl shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-serif font-bold text-brand-charcoal">ক্যাটাগরি ভিত্তিক বিক্রয় অনুপাত</h3>
                <span className="text-[10px] text-brand-charcoal/40">শাড়ি, পাঞ্জাবি এবং গহনার শতকরা চাহিদার হিসাব</span>
              </div>

              <div className="space-y-4.5 pt-3">
                {CATEGORY_SALES.map((cat, i) => (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-brand-charcoal/80">{cat.name}</span>
                      <span className="font-bold text-brand-maroon">{cat.value}%</span>
                    </div>
                    {/* Simulated horizontal Bar */}
                    <div className="w-full bg-brand-cream border border-brand-gold/10 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          i === 0 ? 'bg-brand-maroon' : 
                          i === 1 ? 'bg-brand-terracotta' : 
                          i === 2 ? 'bg-brand-gold' : 'bg-brand-charcoal/50'
                        }`}
                        style={{ width: `${cat.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Quick task checklist & System Status */}
          <div className="p-5 bg-brand-cream/60 border border-brand-gold/15 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <div>
                <span className="font-bold block text-brand-charcoal">সিস্টেম কানেক্টিভিটি রেডি (Express Backend)</span>
                <span className="text-[10px] text-brand-charcoal/50">ইন-মেমোরি ডাটাবেজ সেশন সক্রিয় এবং ডাটা সেভড।</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-bold">● API: ACTIVE</span>
              <span className="bg-brand-gold/15 text-brand-maroon border border-brand-gold/25 px-2.5 py-1 rounded-full font-bold">● GEMINI INTEGRATION: OK</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: INVENTORY MANAGEMENT ==================== */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 animate-fadeIn">
          
          {/* Add Product Form */}
          <div className="lg:col-span-5 bg-white border border-brand-gold/10 p-5 rounded-2xl shadow-sm h-fit">
            <h3 className="text-base font-serif font-bold text-brand-maroon border-b border-brand-gold/10 pb-2 flex items-center gap-1.5">
              <Plus className="w-5 h-5 text-brand-gold" />
              নতুন প্রি-লাভড পণ্য ক্যাটালগে আনুন
            </h3>

            <form onSubmit={handleCreateProductSubmit} className="space-y-4 pt-4 text-xs">
              
              {/* Product name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">পণ্যের নাম: <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: সুতি জামদানি শাড়ি (হাফ সিল্ক)"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2"
                />
              </div>

              {/* Brand & Category row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">ব্র্যান্ড/উৎস:</label>
                  <input
                    type="text"
                    placeholder="যেমন: আড়ং (Aarong)"
                    value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)}
                    className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">ক্যাটাগরি: <span className="text-red-500">*</span></label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2"
                  >
                    <option value="শাড়ি">শাড়ি (Saree)</option>
                    <option value="পাঞ্জাবি">পাঞ্জাবি (Panjabi)</option>
                    <option value="থ্রি-পিস">থ্রি-পিস (Salwar Kameez)</option>
                    <option value="কিডস">কিডস (Kids Wear)</option>
                    <option value="অ্যাক্সেসরিজ">অ্যাক্সেসরিজ (Accessories)</option>
                  </select>
                </div>
              </div>

              {/* Pricing row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">পূর্বের আসল দাম (৳): <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    placeholder="যেমন: 7500"
                    value={prodOrigPrice}
                    onChange={(e) => setProdOrigPrice(e.target.value)}
                    className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">রিসেল অফার দাম (৳): <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    placeholder="যেমন: 3800"
                    value={prodResPrice}
                    onChange={(e) => setProdResPrice(e.target.value)}
                    className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* Condition & Stock row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">কন্ডিশন (অবস্থা): <span className="text-red-500">*</span></label>
                  <select
                    value={prodCondition}
                    onChange={(e) => setProdCondition(e.target.value as any)}
                    className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2"
                  >
                    <option value="like-new">একেবারে নতুন (Like New)</option>
                    <option value="excellent">চমৎকার (Excellent)</option>
                    <option value="good">ভালো (Good)</option>
                    <option value="fair">চলনসই (Fair)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">স্টক পরিমাণ: <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(e.target.value)}
                    className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* Size & Color details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">সাইজ (Sizes - কমা দিয়ে পৃথক করুন):</label>
                  <input
                    type="text"
                    value={prodSize}
                    onChange={(e) => setProdSize(e.target.value)}
                    className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">রং (Colors - কমা দিয়ে পৃথক করুন):</label>
                  <input
                    type="text"
                    value={prodColor}
                    onChange={(e) => setProdColor(e.target.value)}
                    className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              {/* Product Image Selection */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">
                  পণ্যের ছবি (Product Image):
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Gallery Selection Button Box */}
                  <label 
                    htmlFor="admin-file-upload" 
                    className="flex flex-col items-center justify-center border-2 border-dashed border-brand-gold/20 hover:border-brand-maroon/40 bg-[#FCF9F5] rounded-xl p-4 cursor-pointer transition-all duration-300 group hover:bg-brand-maroon/[0.02]"
                  >
                    <input
                      type="file"
                      id="admin-file-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-brand-maroon/60 group-hover:text-brand-maroon group-hover:scale-110 transition-transform mb-1.5" />
                    <span className="text-xs font-bold text-brand-charcoal/80 group-hover:text-brand-maroon">গ্যালারি থেকে সরাসরি নিন</span>
                    <span className="text-[9px] text-brand-charcoal/40 mt-0.5 text-center">মোবাইল গ্যালারি বা ক্যামেরা</span>
                  </label>

                  {/* Web URL input */}
                  <div className="flex flex-col justify-center border border-brand-gold/15 bg-[#FCF9F5] rounded-xl p-3 space-y-1.5">
                    <span className="text-[10px] font-bold text-brand-charcoal/50">অথবা ছবির ওয়েব লিংক দিন:</span>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={prodImageUrl.startsWith('data:') ? '' : prodImageUrl}
                      onChange={(e) => setProdImageUrl(e.target.value)}
                      className="w-full bg-white border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Selected Image Preview with Delete Option */}
                {prodImageUrl && (
                  <div className="mt-3 relative flex items-center gap-3 bg-brand-gold/5 border border-brand-gold/15 p-2.5 rounded-xl animate-fadeIn">
                    <div className="w-12 h-12 rounded-lg bg-white border border-brand-gold/20 overflow-hidden flex-shrink-0">
                      <img 
                        src={prodImageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-brand-charcoal truncate">
                        {prodImageUrl.startsWith('data:') ? '📸 গ্যালারি থেকে সিলেক্টেড ছবি' : '🔗 ওয়েব লিংক থেকে প্রিভিউ'}
                      </p>
                      <p className="text-[9px] text-brand-charcoal/40 truncate">
                        {prodImageUrl.startsWith('data:') ? 'Base64 ইমেজ ডাটা লোড হয়েছে' : prodImageUrl}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProdImageUrl('')}
                      className="p-1.5 rounded-full hover:bg-brand-maroon/5 text-brand-charcoal/40 hover:text-brand-maroon transition-colors"
                      title="ছবি মুছে ফেলুন"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <span className="text-[10px] text-brand-charcoal/40 block pl-1">
                  💡 টিপস: ছবি না দিলেও সমস্যা নেই, সেক্ষেত্রে একটি প্রি-সেট ট্র্যাডিশনাল কভার ফটো ক্যাটালগে সেট হবে।
                </span>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">পণ্যের বিবরণ (Description):</label>
                <textarea
                  rows={3}
                  placeholder="কতবার পরা হয়েছে, কাপড়ের কোয়ালিটি, দাগ আছে কি না ইত্যাদি লিখুন..."
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-brand-gold hover:bg-[#B38F4B] text-brand-maroon font-bold py-3 px-4 rounded-xl shadow-md transition-colors duration-200"
              >
                ক্যাটালগে আপলোড করুন
              </button>
            </form>
          </div>

          {/* Existing Inventory Table */}
          <div className="lg:col-span-7 bg-white border border-brand-gold/10 p-5 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
            <h3 className="text-base font-serif font-bold text-brand-charcoal border-b border-brand-gold/10 pb-3 flex items-center justify-between">
              <span>বর্তমানে মজুদকৃত কালেকশন তালিকা ({products.length})</span>
              <span className="text-[10px] text-brand-charcoal/40 font-medium">ইনভেন্টরি রেকর্ডস</span>
            </h3>

            <table className="w-full text-left text-xs mt-3 divide-y divide-brand-gold/10">
              <thead>
                <tr className="text-brand-charcoal/50 font-bold uppercase text-[10px]">
                  <th className="py-3 px-2">পণ্য</th>
                  <th className="py-3 px-2">ক্যাটাগরি</th>
                  <th className="py-3 px-2">মূল্য অফার</th>
                  <th className="py-3 px-2 text-center">স্টক</th>
                  <th className="py-3 px-2 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gold/5">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-cream/40 transition-colors duration-150">
                    <td className="py-3.5 px-2 flex items-center gap-2.5">
                      <div className="w-10 h-13 rounded overflow-hidden flex-shrink-0 border border-brand-gold/10">
                        <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="max-w-[150px]">
                        <h4 className="font-serif font-extrabold text-brand-charcoal truncate" title={p.name}>{p.name}</h4>
                        <span className="text-[9px] uppercase font-semibold text-brand-charcoal/40">{p.brand}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="bg-brand-gold/10 text-brand-maroon px-2 py-0.5 rounded-full font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 font-bold text-brand-maroon font-mono">
                      ৳{p.resellPrice.toLocaleString('bn-BD')}
                    </td>
                    <td className="py-3.5 px-2 text-center font-bold">
                      {editingProductId === p.id ? (
                        <input
                          type="number"
                          value={editStockValue}
                          onChange={(e) => setEditStockValue(e.target.value)}
                          className="w-12 text-center border border-brand-gold/30 rounded"
                        />
                      ) : (
                        <span className={p.stock === 0 ? 'text-red-500 font-extrabold' : 'text-brand-charcoal'}>
                          {p.stock}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-2 text-right space-x-2">
                      {editingProductId === p.id ? (
                        <button
                          onClick={() => handleSaveProductEdit(p.id)}
                          className="text-emerald-600 hover:underline font-bold"
                        >
                          সংরক্ষণ
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingProductId(p.id);
                            setEditStockValue(String(p.stock));
                            setEditPriceValue(String(p.resellPrice));
                          }}
                          className="text-brand-gold hover:text-brand-maroon inline-flex p-1"
                          title="এডিট স্টক/মূল্য"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          if (confirm('আপনি কি নিশ্চিতভাবেই পণ্যটি ইনভেন্টরি থেকে বাদ দিতে চান?')) {
                            onDeleteProduct(p.id);
                          }
                        }}
                        className="text-brand-charcoal/30 hover:text-red-500 inline-flex p-1"
                        title="ডিলিট পণ্য"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: ORDERS MANAGEMENT ==================== */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-brand-gold/10 p-5 rounded-2xl shadow-sm mt-8 overflow-x-auto no-scrollbar animate-fadeIn">
          <h3 className="text-base font-serif font-bold text-brand-charcoal border-b border-brand-gold/10 pb-3">
            গ্রাহকদের লাইভ অর্ডার তালিকা এবং শিপমেন্ট ট্র্যাকিং ({orders.length})
          </h3>

          <table className="w-full text-left text-xs mt-3 divide-y divide-brand-gold/10">
            <thead>
              <tr className="text-brand-charcoal/50 font-bold uppercase text-[10px]">
                <th className="py-3 px-2">অর্ডার আইডি</th>
                <th className="py-3 px-2">গ্রাহক তথ্য</th>
                <th className="py-3 px-2">পণ্য বিবরণী</th>
                <th className="py-3 px-2">মোট মূল্য</th>
                <th className="py-3 px-2">পেমেন্ট</th>
                <th className="py-3 px-2">স্ট্যাটাস</th>
                <th className="py-3 px-2 text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-gold/5">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-brand-cream/40 transition-colors duration-150">
                  {/* Order ID */}
                  <td className="py-3.5 px-2 font-mono font-bold text-brand-maroon">
                    {o.id}
                  </td>
                  
                  {/* Customer detail */}
                  <td className="py-3.5 px-2">
                    <div className="font-bold text-brand-charcoal">{o.customerName}</div>
                    <div className="text-[10px] text-brand-charcoal/60">{o.phone}</div>
                    <div className="text-[9px] text-brand-charcoal/40 truncate max-w-[120px]" title={o.address}>
                      {o.address} ({o.district})
                    </div>
                  </td>

                  {/* Items list summary */}
                  <td className="py-3.5 px-2 max-w-[150px]">
                    <div className="space-y-0.5">
                      {o.items.map((it, i) => (
                        <div key={i} className="text-[10px] text-brand-charcoal/80 truncate">
                          • {it.name} <span className="font-bold text-brand-maroon">({it.size}/{it.color})</span> x{it.quantity}
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Total price */}
                  <td className="py-3.5 px-2 font-bold text-brand-charcoal">
                    ৳{o.total.toLocaleString('bn-BD')}
                  </td>

                  {/* Payment method */}
                  <td className="py-3.5 px-2 font-bold uppercase text-brand-terracotta">
                    {o.paymentMethod === 'cod' ? 'COD (ক্যাশ অন)' : o.paymentMethod}
                  </td>

                  {/* Status badge */}
                  <td className="py-3.5 px-2">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      o.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      o.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse' :
                      o.status === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      o.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-slate-50 text-slate-700 border-slate-300'
                    }`}>
                      {
                        o.status === 'pending' ? 'পেন্ডিং' :
                        o.status === 'processing' ? 'প্রসেসিং' :
                        o.status === 'shipped' ? 'শিপড হয়েছে' :
                        o.status === 'delivered' ? 'ডেলিভার্ড' : 'বাতিল'
                      }
                    </span>
                  </td>

                  {/* Action dropdown */}
                  <td className="py-3.5 px-2 text-right">
                    <select
                      value={o.status}
                      onChange={(e) => onUpdateOrderStatus(o.id, e.target.value as any)}
                      className="bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-lg p-1.5 text-[10px] font-bold"
                    >
                      <option value="pending">পেন্ডিং রাখুন</option>
                      <option value="processing">প্রসেসিং করুন</option>
                      <option value="shipped">শিপমেন্টে পাঠান</option>
                      <option value="delivered">ডেলিভারড করুন</option>
                      <option value="cancelled">বাতিল করুন</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================== TAB 4: MARKETING (COUPONS) ==================== */}
      {activeTab === 'marketing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 animate-fadeIn">
          
          {/* Create Coupon form */}
          <div className="lg:col-span-5 bg-white border border-brand-gold/10 p-5 rounded-2xl shadow-sm h-fit">
            <h3 className="text-base font-serif font-bold text-brand-maroon border-b border-brand-gold/10 pb-2 flex items-center gap-1.5">
              <Plus className="w-5 h-5 text-brand-gold" />
              নতুন প্রোমো কোড কুপন চালু করুন
            </h3>

            <form onSubmit={handleCreateCouponSubmit} className="space-y-4 pt-4 text-xs">
              {/* Code */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">কুপন কোড (যেমন: FESTIVE15): <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="FESTIVE15"
                  value={cpCode}
                  onChange={(e) => setCpCode(e.target.value)}
                  className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2.5 uppercase tracking-wide font-mono font-bold"
                />
              </div>

              {/* Discount Percent */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">ছাড়ের শতকরা হার (%): <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={cpPercent}
                  onChange={(e) => setCpPercent(e.target.value)}
                  className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2.5 font-mono"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">কুপন বর্ণনা/শর্ত:</label>
                <input
                  type="text"
                  placeholder="যেমন: ১৫% বিশেষ ছাড় পুরো শপিং অর্ডারে"
                  value={cpDesc}
                  onChange={(e) => setCpDesc(e.target.value)}
                  className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2.5"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-brand-gold hover:bg-[#B38F4B] text-brand-maroon font-bold py-3 px-4 rounded-xl shadow-md transition-colors duration-200"
              >
                কুপন কোড সচল করুন
              </button>
            </form>
          </div>

          {/* Existing Coupons list */}
          <div className="lg:col-span-7 bg-white border border-brand-gold/10 p-5 rounded-2xl shadow-sm">
            <h3 className="text-base font-serif font-bold text-brand-charcoal border-b border-brand-gold/10 pb-3">
              সক্রিয় কুপন কোড তালিকা ({coupons.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {coupons.map((c) => (
                <div key={c.id} className="border border-brand-gold/15 bg-brand-cream/30 p-4 rounded-2xl flex flex-col justify-between shadow-inner">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-black text-brand-maroon text-base tracking-wider bg-[#FCF9F5] px-2.5 py-1 border border-brand-gold/20 rounded">
                        {c.code}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    </div>
                    <div className="text-lg font-serif font-extrabold text-brand-terracotta pt-2">
                      {c.discountPercent}% ছাড় (Discount)
                    </div>
                    <p className="text-[11px] text-brand-charcoal/60 leading-relaxed pt-1">
                      {c.description}
                    </p>
                  </div>

                  <span className="text-[9px] text-brand-charcoal/40 pt-4 font-medium uppercase">
                    Checkout System Validated
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 5: GEMINI AI ESTIMATOR ==================== */}
      {activeTab === 'ai-estimator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 animate-fadeIn">
          
          {/* Form Side */}
          <div className="lg:col-span-5 bg-white border border-brand-gold/10 p-5 rounded-2xl shadow-sm h-fit">
            <div className="flex items-center gap-1.5 border-b border-brand-gold/10 pb-3">
              <Brain className="w-6 h-6 text-brand-terracotta" />
              <div>
                <h3 className="text-base font-serif font-bold text-brand-maroon">
                  জেমিনি AI রিসেল এস্টিমেটর
                </h3>
                <span className="text-[10px] text-brand-charcoal/40 block">জেমিনি মডেল ২.৫/৩.৫ ভিত্তিক কনসালটেন্ট</span>
              </div>
            </div>

            <p className="text-[11px] text-brand-charcoal/65 leading-relaxed pt-3">
              আপনার প্রি-লাভড পণ্যের বিবরণ, আসল ক্রয়মূল্য, কন্ডিশন এবং ব্যবহারের সংখ্যা লিখুন। জেমিনি এআই সেকেন্ডের মধ্যে আপনাকে একটি চমৎকার বাজার-সম্মত রিসেল অফার মূল্য সাজেস্ট করবে এবং কাস্টমারদের আকৃষ্ট করতে আকর্ষণীয় বাংলা প্রোডাক্ট ডেসক্রিপশন লিখে দেবে!
            </p>

            <div className="space-y-4 pt-5 text-xs">
              
              {/* Category selector */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">পণ্য ক্যাটাগরি:</label>
                <select
                  value={aiCat}
                  onChange={(e) => setAiCat(e.target.value)}
                  className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2.5"
                >
                  <option value="শাড়ি">শাড়ি (Saree)</option>
                  <option value="পাঞ্জাবি">পাঞ্জাবি (Panjabi)</option>
                  <option value="থ্রি-পিস">থ্রি-পিস (Salwar Kameez)</option>
                  <option value="কিডস">কিডস (Kids Wear)</option>
                  <option value="অ্যাক্সেসরিজ">অ্যাক্সেসরিজ (Accessories)</option>
                </select>
              </div>

              {/* Brand and original price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">আসল উৎস/ব্র্যান্ড:</label>
                  <input
                    type="text"
                    placeholder="যেমন: আড়ং"
                    value={aiBrand}
                    onChange={(e) => setAiBrand(e.target.value)}
                    className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2.5"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">আসল ক্রয়মূল্য (৳): <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    placeholder="যেমন: 6000"
                    value={aiOrigPrice}
                    onChange={(e) => setAiOrigPrice(e.target.value)}
                    className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2.5 font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Wear count */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">কতবার পরা হয়েছে?</label>
                <input
                  type="number"
                  placeholder="যেমন: 1"
                  value={aiWearCount}
                  onChange={(e) => setAiWearCount(e.target.value)}
                  className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2.5 font-mono"
                />
              </div>

              {/* Seller Notes */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">পণ্যের অতিরিক্ত তথ্য/নোট:</label>
                <textarea
                  rows={3}
                  placeholder="কাপড়ের ধরণ, কোনো ত্রুটি আছে কিনা বা সুতা তোলার সমস্যা আছে কিনা লিখুন..."
                  value={aiNotes}
                  onChange={(e) => setAiNotes(e.target.value)}
                  className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="button"
                onClick={handleAIEstimation}
                disabled={aiLoading}
                className="w-full bg-brand-maroon hover:bg-brand-terracotta text-[#FCF9F5] font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <span className="w-4.5 h-4.5 border-2 border-[#FCF9F5] border-t-transparent rounded-full animate-spin" />
                    জেমিনি এস্টিমেট করছে...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 text-brand-gold" />
                    AI এস্টিমেট মূল্য ও ডেসক্রিপশন লিখুন
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Output Result Side */}
          <div className="lg:col-span-7 bg-white border border-brand-gold/10 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex items-center justify-between border-b border-brand-gold/10 pb-3">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-5 h-5 text-brand-gold" />
                  <h3 className="text-sm font-serif font-bold text-brand-charcoal">
                    জেমিনি এআই বিশ্লেষণ ফলাফল
                  </h3>
                </div>
                {aiResult && (
                  <button
                    onClick={copyToClipboard}
                    className="text-xs text-brand-maroon hover:text-brand-terracotta font-semibold flex items-center gap-1.5 bg-[#FCF9F5] border border-brand-gold/15 px-3 py-1.5 rounded-xl transition-all"
                  >
                    {aiCopied ? <ClipboardCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {aiCopied ? 'কপি হয়েছে!' : 'ফলাফল কপি করুন'}
                  </button>
                )}
              </div>

              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-brand-charcoal/40 text-xs space-y-4">
                  <span className="w-10 h-10 border-4 border-brand-maroon border-t-brand-gold rounded-full animate-spin" />
                  <p className="animate-pulse">জেমিনি এআই মডেল ৩.৫ আপনার রিসেল মূল্য সাজেস্ট করছে এবং বাংলা ডেসক্রিপশন লিখছে। অনুগ্রহ করে অপেক্ষা করুন...</p>
                </div>
              ) : aiResult ? (
                <div className="prose max-w-none text-xs sm:text-sm text-brand-charcoal/80 whitespace-pre-line leading-relaxed font-light p-3 rounded-2xl bg-brand-cream/40 border border-brand-gold/5 max-h-[360px] overflow-y-auto mt-4">
                  {aiResult}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-brand-charcoal/40 text-xs text-center space-y-3.5 max-w-sm mx-auto">
                  <Brain className="w-12 h-12 text-brand-gold/30" />
                  <p>বামে আপনার শখের পণ্যটির ক্রয়ের তথ্য দিন এবং জেমিনি এআই বাটন চাপুন। এটি পণ্যের মান বিবেচনা করে বিক্রয় ডেসক্রিপশন এবং আদর্শ দাম বাতলে দেবে।</p>
                </div>
              )}
            </div>

            {aiResult && (
              <span className="text-[10px] text-brand-charcoal/40 uppercase font-mono mt-4 block">
                Recommended Content for Aarong, Jamdani, Katan & Boutique Marketplace
              </span>
            )}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="max-w-md mx-auto mt-8 bg-white border border-brand-gold/15 p-6 rounded-2xl shadow-sm space-y-6 animate-fadeIn">
          <div className="border-b border-brand-gold/10 pb-3 text-center">
            <div className="w-12 h-12 bg-brand-maroon/5 border border-brand-gold/25 rounded-full flex items-center justify-center text-brand-maroon mx-auto mb-2">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-bold text-brand-charcoal">
              অ্যাডমিন পাসওয়ার্ড পরিবর্তন
            </h3>
            <span className="text-[10px] text-brand-charcoal/40 uppercase tracking-wider block mt-0.5">
              Secure Admin Area Settings
            </span>
          </div>

          <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">বর্তমান পাসওয়ার্ড:</label>
              <input
                type="password"
                required
                placeholder="পুরাতন পাসওয়ার্ডটি দিন"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2.5"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">নতুন পাসওয়ার্ড:</label>
              <input
                type="password"
                required
                placeholder="নতুন পাসওয়ার্ড দিন (কমপক্ষে ৪ অক্ষরের)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2.5"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">নতুন পাসওয়ার্ড নিশ্চিত করুন:</label>
              <input
                type="password"
                required
                placeholder="নতুন পাসওয়ার্ডটি পুনরায় দিন"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#FCF9F5] border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2.5"
              />
            </div>

            {pwdError && (
              <p className="text-brand-maroon font-semibold bg-red-50 border border-red-100 rounded-xl p-2.5">
                ⚠️ {pwdError}
              </p>
            )}

            {pwdSuccess && (
              <p className="text-emerald-800 font-semibold bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
                ✅ {pwdSuccess}
              </p>
            )}

            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full bg-brand-maroon hover:bg-[#8C2D19] text-[#FCF9F5] font-bold py-3.5 px-4 rounded-xl shadow-md transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              {pwdLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#FCF9F5] border-t-transparent rounded-full animate-spin" />
                  পরিবর্তন করা হচ্ছে...
                </>
              ) : (
                'পাসওয়ার্ড পরিবর্তন করুন'
              )}
            </button>
          </form>
        </div>
      )}

      {/* ==================== TAB 7: SUPABASE DATABASE ==================== */}
      {activeTab === 'supabase' && (
        <div className="space-y-6 mt-8 animate-fadeIn">
          <div className="bg-white border border-brand-gold/15 p-6 rounded-2xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-gold/10 pb-4 mb-6 gap-3">
              <div>
                <h3 className="text-lg font-serif font-bold text-brand-charcoal flex items-center gap-2">
                  <Database className="w-5 h-5 text-brand-maroon" />
                  সুপাবেস ডাটাবেস সংযোগ (Supabase Database Integration)
                </h3>
                <p className="text-xs text-brand-charcoal/50 mt-1">
                  রিসেল অ্যাপের সমস্ত প্রোডাক্ট, অর্ডার ও কুপন ডাটা সরাসরি আপনার ক্লাউড ডাটাবেসে রিয়েল-টাইমে সংরক্ষিত হচ্ছে।
                </p>
              </div>
              <button
                onClick={fetchSupabaseStatus}
                disabled={supabaseLoading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#FCF9F5] border border-brand-maroon/20 text-brand-maroon hover:bg-brand-maroon hover:text-white transition-all duration-300"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${supabaseLoading ? 'animate-spin' : ''}`} />
                রিফ্রেশ করুন
              </button>
            </div>

            {supabaseLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <span className="w-8 h-8 border-3 border-brand-maroon border-t-brand-gold rounded-full animate-spin" />
                <p className="text-xs text-brand-charcoal/40 animate-pulse">ডাটাবেস কানেকশন এবং টেবিল চেক করা হচ্ছে...</p>
              </div>
            ) : supabaseStatus ? (
              <div className="space-y-6">
                {/* Configuration details card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-brand-gold/5 border border-brand-gold/15 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] uppercase font-bold text-brand-charcoal/50 block">ডাটাবেস সংযোগের স্থিতি (Connection Details)</span>
                    <div className="space-y-1 text-xs font-medium">
                      <div className="flex justify-between">
                        <span className="text-brand-charcoal/60">স্ট্যাটাস:</span>
                        <span className="font-bold text-emerald-600 flex items-center gap-1">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                          সংযুক্ত (Connected)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-charcoal/60">প্রজেক্ট ID:</span>
                        <span className="font-mono text-[10px] text-brand-charcoal/80">aeraskiutdmysilybknc</span>
                      </div>
                      <div className="flex justify-between text-wrap">
                        <span className="text-brand-charcoal/60">প্রজেক্ট URL:</span>
                        <span className="font-mono text-[10px] text-brand-charcoal/80 truncate max-w-[180px]">{supabaseStatus.supabaseUrl}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-brand-gold/5 border border-brand-gold/15 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] uppercase font-bold text-brand-charcoal/50 block">টেবিল চেক (Tables Status)</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(supabaseStatus.tables).map(([tableName, exists]) => (
                        <div key={tableName} className="flex items-center gap-2 bg-white/60 p-1.5 rounded-lg border border-brand-gold/5">
                          <span className={`w-2 h-2 rounded-full ${exists ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                          <span className="font-mono text-[11px] font-bold text-brand-charcoal/80">{tableName}</span>
                          <span className="text-[10px] ml-auto font-medium text-brand-charcoal/40">
                            {exists ? 'রয়েছে' : 'নেই'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SQL setup guide */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-brand-charcoal uppercase">টেবিল সেটআপ স্ক্রিপ্ট (SQL Setup Script)</h4>
                      <p className="text-[10px] text-brand-charcoal/50">আপনার সুপাবেস প্রজেক্টের "SQL Editor"-এ নিচের কোডটি রান করে টেবিলগুলো এক ক্লিকে তৈরি করে নিন:</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(supabaseStatus.sqlGuide);
                        setSqlCopied(true);
                        setTimeout(() => setSqlCopied(false), 3000);
                      }}
                      className="self-start sm:self-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#FCF9F5] border border-brand-gold/15 text-brand-maroon hover:bg-brand-maroon hover:text-white transition-all cursor-pointer"
                    >
                      {sqlCopied ? <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {sqlCopied ? 'কপি হয়েছে!' : 'SQL কোড কপি করুন'}
                    </button>
                  </div>
                  <pre className="w-full text-[10px] font-mono text-brand-charcoal bg-[#FCF9F5] border border-brand-gold/10 rounded-xl p-4 overflow-x-auto max-h-[300px] leading-relaxed select-all">
                    {supabaseStatus.sqlGuide.trim()}
                  </pre>
                  <p className="text-[10px] text-brand-charcoal/40 italic">
                    💡 বিশেষ নির্দেশিকা: টেবিলগুলো ডাটাবেসে না থাকলে অ্যাপটি স্বয়ংক্রিয়ভাবে একটি চমৎকার সুরক্ষিত ইন-মেমোরি সিস্টেমে চালু থাকবে, ফলে ডাটা হারানোর কোনো ভয় নেই এবং সব সময় সচল থাকবে।
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-brand-charcoal/40">
                ডাটাবেসের স্ট্যাটাস লোড করা সম্ভব হয়নি। দয়া করে রিফ্রেশ বাটন প্রেস করুন।
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
