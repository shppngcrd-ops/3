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

  return (
    <div 
      onClick={() => onViewDetails(product)}
      className="group bg-white border border-brand-gold/10 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 flex flex-col"
    >
      {/* Product Image Area */}
      <div className="relative aspect-[3/4] overflow-hidden bg-brand-cream">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-brand-charcoal/70 backdrop-blur-[1px] flex items-center justify-center p-2">
            <span className="text-[#FCF9F5] font-bold text-xs tracking-wider uppercase bg-brand-maroon px-3 py-1.5 rounded shadow-md">
              স্টক শেষ
            </span>
          </div>
        )}
      </div>

      {/* Product Information Area */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <h3 className="text-base font-sans font-extrabold text-brand-charcoal tracking-tight line-clamp-1 uppercase group-hover:text-brand-terracotta transition-colors duration-200">
          {product.name}
        </h3>

        <div className="flex items-center justify-between pt-3 mt-1">
          <span className="text-sm font-medium text-brand-charcoal/60">
            প্রাইস
          </span>
          <span className="text-xl font-black text-[#E11D48] tracking-wider">
            {toBengaliNumber(product.resellPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Helper to convert English numbers to Bengali digits
function toBengaliNumber(num: number | string): string {
  const englishToBengali: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
  };
  return num.toString().split('').map(char => englishToBengali[char] || char).join('');
}
