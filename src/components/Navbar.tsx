/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShoppingBag, Search, Heart, User, ShieldCheck, ShoppingCart } from 'lucide-react';
import { CartItem } from '../types';

interface NavbarProps {
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (admin: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  wishlistCount: number;
  onOpenWishlist: () => void;
}

export default function Navbar({
  cart,
  setIsCartOpen,
  isAdmin,
  setIsAdmin,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  wishlistCount,
  onOpenWishlist
}: NavbarProps) {
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categories = ['সব প্রোডাক্ট', 'শাড়ি', 'পাঞ্জাবি', 'থ্রি-পিস', 'কিডস', 'অ্যাক্সেসরিজ'];

  return (
    <header className="sticky top-0 z-40 bg-[#FCF9F5]/90 backdrop-blur-md border-b border-brand-gold/15">
      {/* Announcement Bar */}
      <div className="bg-brand-maroon text-[#FCF9F5] text-xs py-2 px-4 text-center font-medium tracking-wide">
        ✨ ফ্রি ডেলিভারি ও ১০% স্পেশাল ডিসকাউন্ট পেতে ব্যবহার করুন কোড: <span className="font-bold text-brand-gold bg-[#FCF9F5]/10 px-1.5 py-0.5 rounded ml-1">BORNO10</span> ✨
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => { setSelectedCategory('সব প্রোডাক্ট'); setIsAdmin(false); }}
            className="flex-shrink-0 cursor-pointer flex flex-col"
          >
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold tracking-tight text-brand-maroon leading-tight">
              বরণ <span className="text-brand-gold font-sans font-medium text-lg sm:text-xl ml-1 tracking-widest">RESELL</span>
            </h1>
            <span className="text-[10px] text-brand-charcoal/60 uppercase tracking-widest -mt-1 font-medium">
              Premium Pre-Loved Fashion
            </span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <input
              type="text"
              placeholder="পছন্দের শাড়ি, পাঞ্জাবি বা মাটির গহনা খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FCF9F5] text-brand-charcoal text-sm border border-brand-gold/20 focus:border-brand-terracotta focus:outline-none rounded-full py-2.5 pl-10 pr-4 transition-all duration-300 placeholder:text-brand-charcoal/40 shadow-inner"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-brand-charcoal/40" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Wishlist Button */}
            <button 
              onClick={onOpenWishlist}
              className="relative p-2 text-brand-charcoal hover:text-brand-terracotta transition-colors duration-200"
              title="উইশলিস্ট"
            >
              <Heart className="w-5.5 h-5.5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-terracotta text-white text-[10px] w-4.5 h-4.5 flex items-center justify-center rounded-full font-bold">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 bg-white border border-brand-gold/15 rounded-full hover:border-brand-terracotta transition-all duration-300 hover:shadow-sm"
              title="শপিং ব্যাগ"
            >
              <ShoppingBag className="w-5.5 h-5.5 text-brand-maroon" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-maroon text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-md">
                  {totalCartCount}
                </span>
              )}
            </button>
            
          </div>
        </div>

        {/* Categories Bar & Mobile Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 gap-3">
          
          {/* Mobile Search */}
          <div className="flex md:hidden relative">
            <input
              type="text"
              placeholder="পণ্য খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-brand-charcoal text-xs border border-brand-gold/25 focus:border-brand-terracotta focus:outline-none rounded-full py-2.5 pl-10 pr-4 placeholder:text-brand-charcoal/40"
            />
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-brand-charcoal/40" />
          </div>

          {/* Categories Horizontal Scroll */}
          {!isAdmin && (
            <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 w-full">
              {categories.map((category) => {
                const isSelected = 
                  category === 'সব প্রোডাক্ট' 
                    ? selectedCategory === 'সব প্রোডাক্ট' || selectedCategory === '' 
                    : selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category === 'সব প্রোডাক্ট' ? 'সব প্রোডাক্ট' : category);
                    }}
                    className={`whitespace-nowrap px-4 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 ${
                      isSelected
                        ? 'bg-brand-gold/15 text-brand-terracotta border border-brand-gold/30 font-semibold'
                        : 'text-brand-charcoal/70 hover:text-brand-maroon hover:bg-brand-gold/5 border border-transparent'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}
