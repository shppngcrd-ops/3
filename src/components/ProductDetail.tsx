/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Star, ShoppingBag, Truck, RotateCcw, ShieldCheck, User, MessageSquare } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  onInstantBuy: (product: Product, size: string, color: string) => void;
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
  const [selectedSize, setSelectedSize] = useState(product.size[0] || 'Free Size');
  const [selectedColor, setSelectedColor] = useState(product.color[0] || 'ডিফল্ট');

  // Related products (same category, excluding current product)
  const relatedProducts = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Bengali labels for conditions
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
          desc: 'নিয়মিত কিছুবার ব্যবহার করা হয়েছে। তবে রঙ ও কোয়ালিটি এখনো দারুণভাবে বজায় আছে। ব্যবহারের হালকা ছাপ থাকতে পারে।',
          color: 'text-amber-700 bg-amber-50 border-amber-200' 
        };
      case 'fair':
        return { 
          title: 'চলনসই ব্যবহারযোগ্য (Fair)', 
          desc: 'বেশ কয়েকবার পরা হয়েছে। সাধারণ ব্যবহারের কিছু দাগ বা সুতা আলগা হতে পারে, তবে এখনো পরিধানযোগ্য।',
          color: 'text-slate-700 bg-slate-100 border-slate-200' 
        };
      default:
        return { title: 'ব্যবহৃত', desc: 'সাধারণ কন্ডিশন।', color: 'text-gray-700 bg-gray-100 border-gray-200' };
    }
  };

  const conditionDetails = getConditionDetails(product.condition);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold bg-white border border-brand-maroon/25 text-brand-maroon hover:bg-brand-maroon hover:text-white hover:border-brand-maroon transition-all duration-300 shadow-sm mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        ফিরে যান (সব প্রোডাক্ট)
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white border border-brand-gold/10 p-4 sm:p-8 rounded-3xl shadow-sm">
        
        {/* Left Side: Photo Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-brand-cream border border-brand-gold/10 relative">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.stock === 0 && (
              <div className="absolute inset-0 bg-brand-charcoal/70 backdrop-blur-[2px] flex items-center justify-center">
                <span className="text-white font-serif text-xl tracking-wider uppercase bg-brand-maroon px-6 py-3 rounded-lg border border-brand-gold/30">
                  Sold Out (স্টক শেষ)
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 bg-brand-cream ${
                    activeImage === img ? 'border-brand-terracotta shadow-md' : 'border-brand-gold/15 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
          <div>
            {/* Top Row: Brand & Rating */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <span className="bg-brand-gold/10 text-brand-maroon text-xs tracking-wider font-extrabold px-3 py-1 rounded-full uppercase border border-brand-gold/25">
                {product.brand || 'লোকাল ক্রাফটস'}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-charcoal/80">
                <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-brand-charcoal/40 font-normal">({product.reviews.length} ক্রেতা রিভিউ)</span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-brand-charcoal mt-4 leading-tight">
              {product.name}
            </h1>

            {/* Price section */}
            <div className="mt-4 p-4 rounded-2xl bg-brand-cream/60 border border-brand-gold/10 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-brand-charcoal/50">পূর্বের আসল দাম (Market Price):</span>
                <span className="text-sm text-brand-charcoal/50 line-through">৳{product.originalPrice.toLocaleString('bn-BD')}</span>
                <span className="text-2xl sm:text-3xl font-serif font-extrabold text-brand-maroon mt-0.5">
                  ৳{product.resellPrice.toLocaleString('bn-BD')}
                </span>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-xs text-brand-gold bg-brand-maroon px-3 py-1 rounded-full font-bold shadow">
                  ৳{(product.originalPrice - product.resellPrice).toLocaleString('bn-BD')} সাশ্রয়
                </span>
                <span className="text-[11px] text-brand-charcoal/40 mt-1.5">
                  ({Math.round(((product.originalPrice - product.resellPrice) / product.originalPrice) * 100)}% ছাড়ের সমান)
                </span>
              </div>
            </div>

            {/* Condition Explainer Box */}
            <div className="mt-5 border border-brand-gold/15 rounded-2xl overflow-hidden shadow-inner">
              <div className={`p-3 border-b border-brand-gold/10 font-bold text-xs ${conditionDetails.color} flex items-center justify-between`}>
                <span>প্রোডাক্ট কন্ডিশন: {conditionDetails.title}</span>
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="p-3 bg-brand-cream/30 text-xs text-brand-charcoal/70 leading-relaxed font-light">
                {conditionDetails.desc}
              </div>
            </div>

            {/* Size Selector */}
            {product.size.length > 0 && (
              <div className="mt-5 space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60">
                  সাইজ নির্বাচন করুন:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.size.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-300 ${
                        selectedSize === sz
                          ? 'bg-brand-maroon border-brand-maroon text-white shadow-md'
                          : 'bg-white border-brand-gold/20 hover:border-brand-terracotta text-brand-charcoal/70'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.color.length > 0 && (
              <div className="mt-4 space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-brand-charcoal/60">
                  রং নির্বাচন করুন:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.color.map((cl) => (
                    <button
                      key={cl}
                      onClick={() => setSelectedColor(cl)}
                      className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all duration-300 ${
                        selectedColor === cl
                          ? 'bg-brand-gold border-brand-gold text-brand-maroon shadow-md font-bold'
                          : 'bg-white border-brand-gold/20 hover:border-brand-terracotta text-brand-charcoal/70'
                      }`}
                    >
                      {cl}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status */}
            <div className="mt-5 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${product.stock > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs font-medium text-brand-charcoal/70">
                {product.stock > 0 
                  ? `স্টকে আছে: মাত্র ${product.stock} টি ক্যাটালগ উপলব্ধ!` 
                  : 'স্টক আউট: পণ্যটি ইতিমধ্যে অন্য কোনো ভাগ্যবান ক্রেতা কিনে নিয়েছেন।'}
              </span>
            </div>
          </div>

          {/* Checkout & Actions Section */}
          <div className="space-y-4 pt-6 border-t border-brand-gold/10">
            {product.stock > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  onClick={() => onAddToCart(product, selectedSize, selectedColor)}
                  className="w-full flex items-center justify-center gap-2.5 border-2 border-brand-maroon bg-white text-brand-maroon hover:bg-brand-maroon hover:text-white transition-all duration-300 py-3.5 px-6 rounded-full font-bold text-sm sm:text-base shadow-sm"
                >
                  <ShoppingBag className="w-5 h-5" />
                  কার্টে যোগ করুন
                </button>
                <button
                  onClick={() => onInstantBuy(product, selectedSize, selectedColor)}
                  className="w-full bg-brand-gold hover:bg-[#B38F4B] text-brand-maroon font-extrabold py-3.5 px-6 rounded-full text-sm sm:text-base shadow-lg transition-all duration-300 hover:scale-[1.01]"
                >
                  এখনই কিনুন
                </button>
              </div>
            ) : (
              <button
                disabled
                className="w-full bg-brand-charcoal/10 border border-brand-charcoal/15 text-brand-charcoal/40 py-3.5 px-6 rounded-full font-bold cursor-not-allowed"
              >
                পণ্যটি বর্তমানে উপলব্ধ নেই
              </button>
            )}

            {/* Value Guarantees / Badges */}
            <div className="grid grid-cols-3 gap-3 text-center pt-3">
              <div className="p-2.5 rounded-xl bg-[#FCF9F5] border border-brand-gold/10 flex flex-col items-center gap-1">
                <Truck className="w-5 h-5 text-brand-terracotta" />
                <span className="text-[10px] font-bold text-brand-charcoal/80">দ্রুত ডেলিভারি</span>
                <span className="text-[8px] text-brand-charcoal/50">২৪-৭২ ঘণ্টা</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FCF9F5] border border-brand-gold/10 flex flex-col items-center gap-1">
                <RotateCcw className="w-5 h-5 text-brand-terracotta" />
                <span className="text-[10px] font-bold text-brand-charcoal/80">রিটার্ন পলিসি</span>
                <span className="text-[8px] text-brand-charcoal/50">৭ দিন সহজ রিটার্ন</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FCF9F5] border border-brand-gold/10 flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-brand-terracotta" />
                <span className="text-[10px] font-bold text-brand-charcoal/80">১০০% ভেরিফাইড</span>
                <span className="text-[8px] text-brand-charcoal/50">কোয়ালিটি গ্যারান্টি</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Seller Profile Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
        
        {/* Description Text */}
        <div className="lg:col-span-8 bg-white border border-brand-gold/10 p-6 sm:p-8 rounded-3xl space-y-4">
          <h2 className="text-lg font-serif font-bold text-brand-charcoal border-b border-brand-gold/10 pb-3 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-gold" />
            পণ্যের বিবরণ ও সেলার নোট
          </h2>
          <p className="text-sm sm:text-base text-brand-charcoal/85 leading-relaxed font-light whitespace-pre-line">
            {product.description}
          </p>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-brand-charcoal/70 bg-[#FCF9F5] p-4 rounded-2xl border border-brand-gold/5">
            <div>
              <span className="font-semibold text-brand-maroon">মূল ব্র্যান্ড:</span> {product.brand || 'লোকাল বুটিক/বুননশিল্পী'}
            </div>
            <div>
              <span className="font-semibold text-brand-maroon">কতবার ব্যবহার হয়েছে:</span> {product.condition === 'like-new' ? '১ বার মাত্র বা অব্যবহৃত' : '২-৪ বার পরা হয়েছে'}
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
        <div className="lg:col-span-4 bg-white border border-brand-gold/10 p-6 rounded-3xl flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-charcoal/50 border-b border-brand-gold/10 pb-3">
              সেলার পরিচিতি
            </h2>
            <div className="flex items-center gap-3.5 mt-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-brand-gold/20 flex items-center justify-center border border-brand-gold/25">
                {product.sellerAvatar ? (
                  <img src={product.sellerAvatar} alt={product.sellerName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-brand-maroon" />
                )}
              </div>
              <div>
                <h3 className="font-serif font-extrabold text-brand-charcoal text-base">{product.sellerName}</h3>
                <span className="text-[10px] bg-brand-gold/15 text-brand-terracotta px-2 py-0.5 rounded font-medium">
                  Verified Borno Reseller
                </span>
              </div>
            </div>
            
            <p className="text-xs text-brand-charcoal/60 leading-relaxed mt-4 font-light">
              আমাদের সকল সেলারদের পণ্য সম্পূর্ণ ল্যাব-টেস্টেড এবং কোয়ালিটি কন্ট্রোল টিম দ্বারা ম্যানুয়ালি যাচাইকৃত। এই পণ্যটি কিনতে কোনো দ্বিধা করবেন না!
            </p>
          </div>

          <div className="pt-4 border-t border-brand-gold/10 text-xs text-brand-charcoal/60 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
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
  );
}
