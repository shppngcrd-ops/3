/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  image: string;
  btnText: string;
  category: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    title: 'ঐতিহ্যের পুনর্জন্ম',
    subtitle: 'অভিজাত জামদানি ও কাতান শাড়ি',
    description: '১০০% পরীক্ষিত ও চমৎকার কন্ডিশনের প্রি-লাভড শাড়ি। আভিজাত্য বজায় রাখুন সাশ্রয়ী মূল্যে এবং পরিবেশবান্ধব উপায়ে।',
    tag: 'PRE-LOVED EXQUISITE',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=80',
    btnText: 'কালেকশন দেখুন',
    category: 'শাড়ি'
  },
  {
    id: 2,
    title: 'উৎসবের সাজে পাঞ্জাবি',
    subtitle: 'প্রিমিয়াম সুতি ও খাদি পাঞ্জাবি',
    description: 'ব্র্যান্ডেড ও ডিজাইনার কটন পাঞ্জাবি কালেকশন। নতুনের চেয়ে প্রায় অর্ধেক মূল্যে উৎসবের সেরা প্রস্তুতি নিন।',
    tag: 'FESTIVE EDIT',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=1200&auto=format&fit=crop&q=80',
    btnText: 'পাঞ্জাবি কালেকশন',
    category: 'পাঞ্জাবি'
  },
  {
    id: 3,
    title: 'নান্দনিক মাটির অলঙ্কার',
    subtitle: 'হাতে তৈরি টেরাকোটা ও পিতল গহনা',
    description: 'দেশীয় সংস্কৃতি ও আধুনিকতার মেলবন্ধনে তৈরি অসাধারণ সব নেকলেস, কানবালা ও ঝুমকার অনন্য সংগ্রহ।',
    tag: 'HANDCRAFTED ARTISTRY',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&auto=format&fit=crop&q=80',
    btnText: 'গহনা দেখুন',
    category: 'অ্যাক্সেসরিজ'
  }
];

interface HeroProps {
  onCategorySelect: (cat: string) => void;
}

export default function Hero({ onCategorySelect }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000); // 6 seconds auto-slide
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <div className="relative w-full bg-brand-cream overflow-hidden border-b border-brand-gold/10">
      <div className="relative h-[480px] sm:h-[520px] md:h-[560px] w-full flex items-center">
        
        {/* Slides */}
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out flex items-center ${
              index === currentSlide 
                ? 'opacity-100 z-10 scale-100' 
                : 'opacity-0 z-0 scale-95 pointer-events-none'
            }`}
          >
            {/* Background Image with Dark & Cream Gradient Overlay */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover object-center filter brightness-[0.45] md:brightness-100"
              />
              {/* Desktop double gradient overlay for high editorial readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-brand-maroon via-brand-maroon/90 to-transparent hidden md:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-maroon via-brand-maroon/80 to-brand-maroon/30 md:hidden" />
            </div>

            {/* Slide Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-20 text-[#FCF9F5] md:text-left flex flex-col justify-center h-full">
              <div className="max-w-2xl space-y-4 md:space-y-6">
                
                {/* Floating Tag */}
                <div className="inline-flex items-center gap-1.5 bg-brand-gold/20 backdrop-blur-md border border-brand-gold/40 px-3 py-1 rounded-full text-[10px] sm:text-xs uppercase tracking-widest font-semibold text-brand-gold">
                  <Sparkles className="w-3 h-3" />
                  {slide.tag}
                </div>

                {/* Heading Stack */}
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-brand-gold font-serif text-lg sm:text-xl md:text-2xl font-semibold tracking-wide">
                    {slide.subtitle}
                  </p>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight leading-tight">
                    {slide.title}
                  </h2>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-[#FCF9F5]/85 font-light leading-relaxed max-w-lg">
                  {slide.description}
                </p>

                {/* CTA Buttons */}
                <div className="pt-3 sm:pt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onCategorySelect(slide.category)}
                    className="bg-brand-gold hover:bg-[#B38F4B] text-brand-maroon font-bold text-sm sm:text-base px-6 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-[1.03]"
                  >
                    {slide.btnText}
                  </button>
                  <button
                    onClick={() => onCategorySelect('সব প্রোডাক্ট')}
                    className="border border-[#FCF9F5]/40 hover:border-[#FCF9F5] bg-[#FCF9F5]/10 hover:bg-[#FCF9F5]/20 text-[#FCF9F5] font-semibold text-xs sm:text-sm px-5 py-3 rounded-full transition-all duration-300"
                  >
                    সব ক্যাটাগরি দেখুন
                  </button>
                </div>
                
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Arrow Controllers */}
        <button
          onClick={handlePrev}
          className="absolute left-4 z-20 p-2.5 rounded-full border border-[#FCF9F5]/15 bg-[#FCF9F5]/10 hover:bg-[#FCF9F5]/25 text-[#FCF9F5] transition-all duration-300 hidden sm:flex hover:scale-105"
          title="পূর্ববর্তী"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 z-20 p-2.5 rounded-full border border-[#FCF9F5]/15 bg-[#FCF9F5]/10 hover:bg-[#FCF9F5]/25 text-[#FCF9F5] transition-all duration-300 hidden sm:flex hover:scale-105"
          title="পরবর্তী"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Indicator Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-6 bg-brand-gold' : 'w-2 bg-[#FCF9F5]/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
