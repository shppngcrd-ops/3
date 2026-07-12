/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Star, ShoppingBag, Truck, RotateCcw, ShieldCheck, User, MessageSquare, Clipboard, Check, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, size: string, color: string, qty: number) => void;
  onInstantBuy: (product: Product, size: string, color: string, qty: number) => void;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
}

export default function ProductDetail({
  product,
  onBack,
  onAddToCart,
  onInstantBuy,
  allProducts,
  onSelectProduct,
}: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState(product.size[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.color[0] || 'ডিফল্ট');
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  // Related products (same category, excluding current product)
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id);

  const getConditionDetails = (cond: Product['condition']) => {
    switch (cond) {
      case 'like-new':
        return { 
          title: 'একেবারে নতুন (Like New)', 
          desc: 'প্রোডাক্টটি একদম নতুনের মতো। ১ বার বা কোনোক্ষেত্রেই পরা হয়নি, কোনো ধরনের খামতি বা দাগ নেই।',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200' 
        };
      case 'excellent':
        return { 
          title: 'চমৎকার কন্ডিশন (Excellent)', 
          desc: 'অল্প কয়েকবার অত্যন্ত যত্নে পরা হয়েছে। কোনো দৃশ্যমান দাগ বা ছেঁড়াফাটা নেই, একদম নতুনের মতো উজ্জ্বল।',
          color: 'text-blue-700 bg-blue-50 border-blue-200' 
        };
      case 'good':
        return { 
          title: 'ভালো কন্ডিশন (Good)', 
          desc: 'নিয়মিত কিছুবার ব্যবহার করা হয়েছে। তবে রঙ ও কোয়ালিটি এখনো দারুণভাবে বজায় আছে।',
          color: 'text-amber-700 bg-amber-50 border-amber-200' 
        };
      case 'fair':
      default:
        return { 
          title: 'চলনসই (Fair)', 
          desc: 'বেশ কিছুবার পরা হয়েছে এবং স্বাভাবিক ব্যবহারের সাধারণ চিহ্ন বা মৃদু দাগ থাকতে পারে।',
          color: 'text-orange-700 bg-orange-50 border-orange-200' 
        };
    }
  };

  const conditionDetails = getConditionDetails(product.condition);

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(product.description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to convert numbers to Bengali digits
  const toBengali = (num: number | string): string => {
    const englishToBengali: Record<string, string> = {
      '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
      '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
    };
    return num.toString().split('').map(char => englishToBengali[char] || char).join('');
  };

  const availableSizes = product.size && product.size.length > 0 ? product.size : ['M', 'L', 'XL'];

  return (
    <div className="w-full min-h-screen bg-[#F3F4F6] py-4 sm:py-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black bg-brand-maroon text-[#FCF9F5] hover:bg-brand-terracotta border border-brand-maroon hover:border-brand-terracotta transition-all duration-300 shadow-md mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1 text-brand-gold" />
          ← ব্যাক করুন (সব প্রোডাক্টে ফিরে যান)
        </button>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Side: Photo Gallery & Instant Order Button */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-gray-100 p-4 rounded-3xl shadow-sm space-y-4">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-brand-cream relative">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-brand-charcoal/70 backdrop-blur-[1px] flex items-center justify-center">
                    <span className="text-white font-serif text-lg tracking-wider uppercase bg-brand-maroon px-4 py-2 rounded-lg border border-brand-gold/30">
                      স্টক শেষ
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2 pb-1 overflow-x-auto">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-brand-cream shrink-0 transition-all ${
                        activeImage === img ? 'border-brand-maroon shadow-sm' : 'border-gray-200 opacity-80'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Instant Order Button replacing "ছবি ডাউনলোড" / "ফেভারিট" */}
              {product.stock > 0 ? (
                <button
                  onClick={() => onInstantBuy(product, selectedSize, selectedColor, quantity)}
                  className="w-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-extrabold py-3.5 px-6 rounded-2xl text-sm sm:text-base shadow-md transition-all duration-300 hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5 text-brand-gold" />
                  অর্ডার নাও
                </button>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-400 font-extrabold py-3.5 px-6 rounded-2xl text-sm cursor-not-allowed border border-gray-200 text-center"
                >
                  স্টক উপলব্ধ নেই
                </button>
              )}
            </div>
          </div>

          {/* Right Side: Product Details */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white border border-gray-100 p-5 sm:p-7 rounded-3xl shadow-sm space-y-6">
              
              {/* Green Discount Banner & Verified Product Badge */}
              <div className="bg-[#EBFDF4] border border-[#A7F3D0]/50 text-[#047857] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                <span className="text-xs font-semibold leading-relaxed">
                  চলছে বিশেষ ডিসকাউন্ট অফার প্রাইজ। কোয়ালিটি ভালো আগের মতোই, মূলত স্টকের প্রোডাক্ট শেষ করার জন্যই এই অফার।
                </span>
                <span className="text-[10px] bg-white border border-[#047857]/20 text-[#047857] px-2.5 py-1 rounded-full font-bold shrink-0 flex items-center gap-1 shadow-sm self-start sm:self-auto">
                  ✓ ভেরিফাইড প্রোডাক্ট
                </span>
              </div>

              {/* Title & Price Info Row */}
              <div className="space-y-4">
                <h1 className="text-xl sm:text-2xl font-sans font-extrabold text-brand-charcoal uppercase tracking-tight">
                  {product.name}
                </h1>

                {/* Info Bar: Price | Stock | Ratings */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm border-t border-b border-gray-100 py-3 text-brand-charcoal">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-500">প্রাইস:</span>
                    <span className="text-lg font-black text-[#E11D48]">
                      ৳{toBengali(product.resellPrice)}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-gray-200 hidden sm:block" />
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-500">স্টক:</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${product.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {product.stock > 0 ? 'আছে' : 'শেষ'}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-gray-200 hidden sm:block" />
                  <div className="flex items-center gap-1 text-amber-400">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4" fill={i < 4 ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <span className="text-xs text-brand-charcoal/80 font-bold ml-1">
                      {product.rating.toFixed(1)} / ৫
                    </span>
                  </div>
                </div>
              </div>

              {/* Suggestions and SKU */}
              <div className="space-y-2.5 bg-[#F9FAFB] p-4 rounded-2xl border border-gray-100 text-xs">
                <div className="text-gray-600 font-semibold leading-relaxed flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-maroon" />
                  <span>প্রোডাক্টটির সাজেস্টেড বিক্রয় মূল্য সর্বোচ্চ <span className="font-bold text-brand-maroon">৳{toBengali(product.originalPrice)}</span> টাকা।</span>
                </div>
                <div className="text-gray-500 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span>SKU: {toBengali(product.id.slice(0, 5).toUpperCase().replace(/\D/g, '') || '২৯৯৪৩')}</span>
                </div>
              </div>

              {/* Size Selector in Circle checkbox/radio format */}
              <div className="space-y-3">
                <span className="block text-sm font-bold text-brand-charcoal">
                  সাইজ:
                </span>
                <div className="flex flex-wrap gap-5">
                  {availableSizes.map((sz) => (
                    <label 
                      key={sz} 
                      className={`flex items-center gap-2 cursor-pointer text-sm font-semibold text-brand-charcoal px-3 py-1.5 rounded-xl border transition-all ${
                        selectedSize === sz 
                          ? 'border-brand-maroon bg-brand-maroon/5 font-bold' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="product-size"
                        value={sz}
                        checked={selectedSize === sz}
                        onChange={() => setSelectedSize(sz)}
                        className="w-4 h-4 text-brand-maroon focus:ring-brand-maroon border-gray-300"
                      />
                      <span>{sz}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quantity Counter Block */}
              <div className="space-y-3">
                <span className="block text-sm font-bold text-brand-charcoal">
                  পরিমাণ/পিস
                </span>
                <div className="flex items-center border border-gray-200 rounded-xl bg-[#F9FAFB] w-fit overflow-hidden">
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 text-lg font-bold border-r border-gray-200 text-gray-500 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 text-sm font-extrabold text-brand-charcoal min-w-[50px] text-center">
                    {toBengali(quantity)}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100 text-lg font-bold border-l border-gray-200 text-gray-500 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Informative Warning box */}
              <div className="bg-[#EFF6FF] border border-[#DBEAFE]/60 text-[#1E40AF] p-3.5 rounded-xl text-xs flex items-center gap-2">
                <ShieldCheck className="w-4.5 h-4.5 shrink-0 text-[#2563EB]" />
                <span>কুরিয়ার চার্জের অপশন পরবর্তী পেইজে পাবেন।</span>
              </div>

              {/* Add to Order List Action Button */}
              {product.stock > 0 && (
                <button
                  onClick={() => onAddToCart(product, selectedSize, selectedColor, quantity)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all duration-300 py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base shadow-sm"
                >
                  <ShoppingBag className="w-5 h-5" />
                  অর্ডার তালিকায় অ্যাড করুন
                </button>
              )}

            </div>
          </div>

        </div>

        {/* Description & Seller Profile Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
          
          {/* Description Text with Copy Button */}
          <div className="lg:col-span-8 bg-white border border-gray-100 p-6 sm:p-8 rounded-3xl space-y-4 shadow-sm relative">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="text-base sm:text-lg font-sans font-bold text-brand-charcoal flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#E11D48]" />
                পণ্যের বিবরণ
              </h2>
              
              {/* Copy Button */}
              <button
                onClick={handleCopyDescription}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F3F4F6] hover:bg-gray-200 text-brand-charcoal transition-all active:scale-95 border border-gray-200"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>কপি করুন</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-sm sm:text-base text-brand-charcoal/85 leading-relaxed font-normal whitespace-pre-line pt-1">
              {product.description}
            </p>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-brand-charcoal/70 bg-[#FCF9F5] p-4 rounded-2xl border border-brand-gold/5">
              <div>
                <span className="font-semibold text-brand-maroon">মূল ব্র্যান্ড:</span> {product.brand || 'লোকাল বুটিক/বুননশিল্পী'}
              </div>
              <div>
                <span className="font-semibold text-brand-maroon">কন্ডিশন:</span> {conditionDetails.title}
              </div>
              <div>
                <span className="font-semibold text-brand-maroon">রিসেল ক্যাটাগরি:</span> {product.category}
              </div>
              <div>
                <span className="font-semibold text-brand-maroon">যুক্ত করা হয়েছে:</span> {product.dateAdded}
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="lg:col-span-4 bg-white border border-gray-100 p-6 rounded-3xl flex flex-col justify-between space-y-4 shadow-sm">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-brand-charcoal/50 border-b border-gray-100 pb-3">
                সেলার পরিচিতি
              </h2>
              <div className="flex items-center gap-3.5 mt-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#FCF9F5] flex items-center justify-center border border-gray-200">
                  {product.sellerAvatar ? (
                    <img src={product.sellerAvatar} alt={product.sellerName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-brand-maroon" />
                  )}
                </div>
                <div>
                  <h3 className="font-sans font-extrabold text-[#111827] text-base">{product.sellerName}</h3>
                  <span className="text-[10px] bg-brand-gold/15 text-brand-terracotta px-2 py-0.5 rounded font-bold">
                    Verified Reseller
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-brand-charcoal/60 leading-relaxed mt-4 font-normal">
                আমাদের সকল সেলারদের পণ্য সম্পূর্ণ ল্যাব-টেস্টেড এবং কোয়ালিটি কন্ট্রোল টিম দ্বারা ম্যানুয়ালি যাচাইকৃত। এই পণ্যটি কিনতে কোনো দ্বিধা করবেন না!
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 text-xs text-brand-charcoal/60 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>সেলার বর্তমানে রেসপন্সিভ আছেন</span>
            </div>
          </div>
        </div>

        {/* Reviews Tab */}
        <div className="bg-white border border-brand-gold/10 p-6 sm:p-8 rounded-3xl mt-10 space-y-6">
        <h2 className="text-lg font-serif font-bold text-brand-charcoal border-b border-brand-gold/10 pb-3 flex items-center justify-between">
          <span>ক্রেতাদের রিভিউজ ({product.reviews.length})</span>
          <div className="flex items-center gap-1.5 text-xs text-brand-charcoal/80">
            <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
            <span className="font-bold">{product.rating.toFixed(1)} / 5</span>
          </div>
        </h2>

        {product.reviews.length === 0 ? (
          <div className="text-center py-8 text-brand-charcoal/40 text-xs leading-loose">
            এই প্রি-লাভড ক্যাটালগটির জন্য কোনো লিখিত রিভিউ পাওয়া যায়নি। সেলার ভেরিফিকেশন স্কোরের ওপর ভিত্তি করে পণ্যটির বিবরণ সাজানো হয়েছে।
          </div>
        ) : (
          <div className="divide-y divide-brand-gold/10">
            {product.reviews.map((rev) => (
              <div key={rev.id} className="py-5 first:pt-0 last:pb-0 space-y-2">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="font-serif font-bold text-sm text-brand-charcoal">{rev.author}</span>
                  <span className="text-[10px] text-brand-charcoal/40 font-mono">{rev.date}</span>
                </div>
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5"
                      fill={i < rev.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-brand-charcoal/80 font-light leading-relaxed">
                  {rev.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-14 space-y-6">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-brand-charcoal text-center">
            অনুরূপ আরও রিসেল কালেকশন (Related Products)
          </h2>
          <div className="w-24 h-0.5 bg-brand-gold mx-auto -mt-3" />

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
            {relatedProducts.map((p) => {
              const discount = Math.round(((p.originalPrice - p.resellPrice) / p.originalPrice) * 100);
              return (
                <div 
                  key={p.id}
                  onClick={() => onSelectProduct(p)}
                  className="group bg-white border border-brand-gold/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-brand-gold/25"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-brand-cream">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {discount > 0 && (
                      <span className="absolute top-2.5 left-2.5 bg-brand-gold text-brand-maroon text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm">
                        {discount}% ছাড়
                      </span>
                    )}
                  </div>
                  <div className="p-3.5 space-y-1">
                    <span className="text-[10px] text-brand-charcoal/40 uppercase font-semibold">{p.brand}</span>
                    <h4 className="text-xs sm:text-sm font-serif font-extrabold text-brand-charcoal truncate">{p.name}</h4>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs sm:text-sm font-bold text-brand-maroon">৳{p.resellPrice.toLocaleString('bn-BD')}</span>
                      <span className="text-[10px] text-brand-charcoal/40 line-through">৳{p.originalPrice.toLocaleString('bn-BD')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  </div>
);
}
