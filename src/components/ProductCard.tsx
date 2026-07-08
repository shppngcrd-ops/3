/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Eye, Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string;
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export default function ProductCard({
  product,
  onViewDetails,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
}: ProductCardProps) {
  // Calculate discount percentage
  const discountPercent = Math.round(
    ((product.originalPrice - product.resellPrice) / product.originalPrice) * 100
  );

  // Bengali labels for conditions
  const getConditionLabel = (cond: Product['condition']) => {
    switch (cond) {
      case 'like-new':
        return { text: 'একেবারে নতুন (Like New)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'excellent':
        return { text: 'চমৎকার কন্ডিশন (Excellent)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'good':
        return { text: 'ভালো কন্ডিশন (Good)', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'fair':
        return { text: 'চলনসই (Fair)', color: 'bg-slate-100 text-slate-700 border-slate-300' };
      default:
        return { text: 'ব্যবহৃত', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const condBadge = getConditionLabel(product.condition);

  return (
    <div className="group flex flex-col bg-white border border-brand-gold/10 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-brand-gold/30 hover:-translate-y-1">
      {/* Product Image Area */}
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-cream cursor-pointer" onClick={() => onViewDetails(product)}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badges on Image */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="bg-brand-maroon text-[#FCF9F5] text-[10px] tracking-widest font-bold px-2.5 py-1 rounded-full uppercase shadow-md">
              নতুন প্রাপ্তি
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-brand-gold text-brand-maroon text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
              {discountPercent}% ছাড়
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 shadow-md ${
            isWishlisted
              ? 'bg-brand-terracotta text-white'
              : 'bg-white/80 hover:bg-white text-brand-charcoal/70 hover:text-brand-terracotta'
          }`}
          title={isWishlisted ? 'উইশলিস্ট থেকে বাদ দিন' : 'উইশলিস্টে রাখুন'}
        >
          <Heart className="w-4.5 h-4.5" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Out of Stock Overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-brand-charcoal/75 backdrop-blur-[2px] flex items-center justify-center p-4">
            <span className="text-[#FCF9F5] font-bold text-sm tracking-wider uppercase bg-brand-maroon/90 px-4 py-2 rounded border border-brand-gold/20 shadow-md">
              স্টক শেষ (Sold Out)
            </span>
          </div>
        )}

        {/* Hover Actions Bar */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-brand-charcoal/85 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-between translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(product);
            }}
            className="flex items-center gap-1 bg-[#FCF9F5] hover:bg-brand-gold text-brand-maroon text-xs font-semibold px-3 py-1.5 rounded-full transition-colors duration-200"
          >
            <Eye className="w-3.5 h-3.5" />
            বিস্তারিত
          </button>
          
          {product.stock > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="flex items-center gap-1 bg-brand-gold hover:bg-brand-maroon hover:text-white text-brand-maroon text-xs font-bold px-3 py-1.5 rounded-full transition-colors duration-200"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              কার্টে যোগ
            </button>
          )}
        </div>
      </div>

      {/* Product Information Area */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Brand and Condition Badge */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-brand-charcoal/50">
              {product.brand || 'লোকাল ক্রাফট/বুটিক'}
            </span>
            <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${condBadge.color}`}>
              {condBadge.text}
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onViewDetails(product)}
            className="text-base font-serif font-bold text-brand-charcoal hover:text-brand-terracotta cursor-pointer line-clamp-1 transition-colors duration-200"
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-xs text-brand-charcoal/60">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-3.5 h-3.5"
                  fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <span className="font-semibold text-brand-charcoal/80 ml-0.5">{product.rating.toFixed(1)}</span>
            {product.reviews.length > 0 && (
              <span className="text-[10px] text-brand-charcoal/40">({product.reviews.length} রিভিউ)</span>
            )}
          </div>
        </div>

        {/* Pricing Area */}
        <div className="pt-3 border-t border-brand-gold/10 mt-3 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-brand-charcoal/40 line-through">
              মূল মূল্য: ৳{product.originalPrice.toLocaleString('bn-BD')}
            </span>
            <span className="text-lg font-bold text-brand-maroon tracking-wide">
              ৳{product.resellPrice.toLocaleString('bn-BD')}
            </span>
          </div>

          <span className="text-[10px] bg-brand-gold/10 text-brand-terracotta border border-brand-gold/20 px-2 py-1 rounded font-medium">
            সংরক্ষণ: ৳{(product.originalPrice - product.resellPrice).toLocaleString('bn-BD')}
          </span>
        </div>
      </div>
    </div>
  );
}
