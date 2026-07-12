/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, Tag, ShoppingBag, Truck, Gift, CheckCircle2, Ticket } from 'lucide-react';
import { CartItem, Coupon, Order } from '../types';
import { apiFetch } from '../utils/api';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, size: string, color: string, newQty: number) => void;
  onRemoveItem: (productId: string, size: string, color: string) => void;
  activeCoupons: Coupon[];
  onOrderCompleted: (newOrder: Order) => void;
  onClearCart: () => void;
}

export default function Cart({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  activeCoupons,
  onOrderCompleted,
  onClearCart,
}: CartProps) {
  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState<'Dhaka' | 'Chittagong' | 'Sylhet' | 'Rajshahi' | 'Khulna' | 'Barisal' | 'Rangpur' | 'Mymensingh'>('Dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'card'>('cod');
  
  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');

  // General States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutSuccessOrder, setCheckoutSuccessOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Calculators
  const subtotal = cart.reduce((sum, item) => sum + item.product.resellPrice * item.quantity, 0);
  const deliveryCharge = district === 'Dhaka' ? 60 : 120;
  
  let discount = 0;
  if (appliedCoupon) {
    discount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    // Limit discount to 500 BDT max
    if (discount > 500) discount = 500;
  }

  const total = subtotal + deliveryCharge - discount;

  // Verify Coupon
  const handleApplyCoupon = () => {
    setCouponError('');
    const coupon = activeCoupons.find((c) => c.code.toUpperCase() === couponInput.trim().toUpperCase() && c.active);
    if (coupon) {
      setAppliedCoupon(coupon);
      setCouponInput('');
    } else {
      setCouponError('দুঃখিত, কুপন কোডটি সঠিক নয় অথবা মেয়াদ শেষ!');
    }
  };

  // Submit Checkout to Backend
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      alert('দয়া করে নাম, সচল মোবাইল নম্বর এবং পূর্ণ ঠিকানা প্রদান করুন!');
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      customerName,
      email,
      phone,
      address,
      district,
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.resellPrice,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
        image: item.product.images[0]
      })),
      subtotal,
      deliveryCharge,
      discount,
      total,
      paymentMethod
    };

    try {
      const response = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const result = await response.json();
      
      if (result.success) {
        setCheckoutSuccessOrder(result.data);
        onOrderCompleted(result.data);
        onClearCart();
        // Clear forms
        setCustomerName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setAppliedCoupon(null);
      } else {
        alert('অর্ডার সাবমিট করতে ত্রুটি হয়েছে: ' + result.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('সার্ভার কানেকশন এরর! দয়া করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-sm transition-opacity duration-300" 
      />

      {/* Main Drawer Container */}
      <div className="absolute inset-y-0 right-0 w-full sm:w-auto sm:pl-10 max-w-full flex">
        <div className="w-full sm:w-screen sm:max-w-lg bg-[#FCF9F5] border-l border-brand-gold/15 shadow-2xl flex flex-col h-full animate-slideIn">
          
          {/* Drawer Header */}
          <div className="px-5 py-5 border-b border-brand-gold/10 bg-brand-maroon text-[#FCF9F5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5.5 h-5.5 text-brand-gold" />
              <h2 className="text-lg font-serif font-bold tracking-tight">আপনার শপিং ব্যাগ</h2>
              {!checkoutSuccessOrder && (
                <span className="bg-brand-gold text-brand-maroon text-xs font-bold px-2 py-0.5 rounded-full">
                  {cart.length}
                </span>
              )}
            </div>
            <button 
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-brand-gold text-brand-maroon hover:bg-[#FCF9F5] hover:text-brand-maroon transition-all duration-300 shadow-sm"
            >
              ← ব্যাক করুন (ফিরে যান)
            </button>
          </div>

          {/* Drawer Body content */}
          <div className="flex-1 overflow-y-auto p-5 no-scrollbar space-y-6">
            
            {checkoutSuccessOrder ? (
              /* ORDER CONFIIRMED SUCCESS SCREEN */
              <div className="text-center py-8 space-y-5 animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-serif font-black text-brand-charcoal text-xl">অর্ডার সফল হয়েছে!</h3>
                  <p className="text-xs text-brand-charcoal/60">বরণ ফ্যাশন রিসেল থেকে পণ্য কেনাকাটার জন্য ধন্যবাদ।</p>
                </div>

                {/* Invoice Recap */}
                <div className="bg-white border border-brand-gold/10 rounded-2xl p-4 text-left text-xs space-y-3.5 shadow-sm">
                  <div className="flex justify-between font-bold border-b border-brand-gold/5 pb-2">
                    <span className="text-brand-charcoal/60">অর্ডার আইডি:</span>
                    <span className="text-brand-maroon">{checkoutSuccessOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-charcoal/60">কাস্টমার নাম:</span>
                    <span>{checkoutSuccessOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-charcoal/60">মোবাইল নম্বর:</span>
                    <span>{checkoutSuccessOrder.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-charcoal/60">ডেলিভারি ঠিকানা:</span>
                    <span className="text-right max-w-[200px] truncate" title={checkoutSuccessOrder.address}>
                      {checkoutSuccessOrder.address}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span className="text-brand-charcoal/60">পেমেন্ট পদ্ধতি:</span>
                    <span className="uppercase text-brand-terracotta">{checkoutSuccessOrder.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : checkoutSuccessOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between font-bold text-brand-maroon border-t border-brand-gold/5 pt-2.5 text-sm">
                    <span>সর্বমোট পরিশোধযোগ্য:</span>
                    <span>৳{checkoutSuccessOrder.total.toLocaleString('bn-BD')}</span>
                  </div>
                </div>

                {/* Delivery and Tracking Notice */}
                <div className="p-4 bg-brand-gold/10 border border-brand-gold/20 rounded-2xl text-left text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-brand-terracotta">
                    <Truck className="w-4 h-4" />
                    <span>কুরিয়ার ট্র্যাকিং কোড</span>
                  </div>
                  <p className="font-mono text-brand-charcoal/80 font-semibold bg-white border border-brand-gold/10 px-2.5 py-1.5 rounded inline-block text-[11px]">
                    {checkoutSuccessOrder.trackingCode}
                  </p>
                  <p className="text-[10px] text-brand-charcoal/50 leading-relaxed pt-1">
                    ঢাকা সিটির মধ্যে ২৪-৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে ৭২ ঘণ্টার মধ্যে আমাদের পার্টনার কুরিয়ার আপনার ঠিকানায় পণ্য পৌঁছে দেবে।
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCheckoutSuccessOrder(null);
                    onClose();
                  }}
                  className="w-full bg-brand-maroon hover:bg-brand-terracotta text-white font-bold py-3 px-5 rounded-full text-xs sm:text-sm transition-colors duration-200 shadow-md"
                >
                  কেনাকাটা চালিয়ে যান
                </button>
              </div>
            ) : cart.length === 0 ? (
              /* EMPTY CART SCREEN */
              <div className="text-center py-16 space-y-4 text-brand-charcoal/50">
                <ShoppingBag className="w-14 h-14 mx-auto text-brand-gold/50" />
                <p className="text-sm font-medium">আপনার শপিং ব্যাগটি বর্তমানে খালি আছে!</p>
                <button
                  onClick={onClose}
                  className="bg-brand-maroon hover:bg-brand-terracotta text-[#FCF9F5] font-semibold text-xs px-5 py-2.5 rounded-full transition-colors duration-200"
                >
                  প্রোডাক্টস ব্রাউজ করুন
                </button>
              </div>
            ) : (
              /* CART ITEMS LIST & CHECKOUT FORM */
              <>
                {/* Cart Items */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50 border-b border-brand-gold/10 pb-2">
                    আইটেম তালিকা
                  </h3>
                  <div className="divide-y divide-brand-gold/10 space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {cart.map((item, i) => (
                      <div key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${i}`} className="flex gap-3.5 pt-3 first:pt-0">
                        {/* Thumbnail */}
                        <div className="w-14 h-18 rounded-lg overflow-hidden border border-brand-gold/10 flex-shrink-0 bg-brand-cream">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        {/* Detail */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-serif font-bold text-brand-charcoal line-clamp-1">{item.product.name}</h4>
                            <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-brand-charcoal/50 font-medium mt-0.5">
                              {item.selectedSize && <span className="bg-brand-gold/10 text-brand-maroon border border-brand-gold/10 px-1 py-0.2 rounded">{item.selectedSize}</span>}
                              {item.selectedColor && <span className="bg-brand-gold/10 text-brand-maroon border border-brand-gold/10 px-1 py-0.2 rounded">{item.selectedColor}</span>}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1.5">
                            {/* Quantity buttons */}
                            <div className="flex items-center border border-brand-gold/20 rounded-full bg-white px-2 py-0.5 gap-2">
                              <button 
                                onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                                className="text-brand-charcoal/60 hover:text-brand-terracotta p-0.5"
                                title="পরিমাণ কমান"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-brand-charcoal">{item.quantity}</span>
                              <button 
                                onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                                className="text-brand-charcoal/60 hover:text-brand-terracotta p-0.5"
                                title="পরিমাণ বাড়ান"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            
                            {/* Price and delete */}
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-bold text-brand-maroon">৳{(item.product.resellPrice * item.quantity).toLocaleString('bn-BD')}</span>
                              <button
                                onClick={() => onRemoveItem(item.product.id, item.selectedSize, item.selectedColor)}
                                className="text-brand-charcoal/40 hover:text-red-500 transition-colors duration-150"
                                title="বাদ দিন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Code Coupon Area */}
                <div className="bg-white border border-brand-gold/10 rounded-2xl p-4.5 space-y-3 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-charcoal/70">
                    <Tag className="w-4 h-4 text-brand-gold" />
                    <span>প্রোমো কোড / কুপন কোড</span>
                  </div>
                  
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>কুপন <strong>{appliedCoupon.code}</strong> কার্যকর (ডিসকাউন্ট: {appliedCoupon.discountPercent}%)</span>
                      </div>
                      <button 
                        onClick={() => setAppliedCoupon(null)}
                        className="text-brand-charcoal/40 hover:text-red-500 font-bold"
                      >
                        বাতিল
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="কোড লিখুন (যেমন: BORNO10)"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          className="flex-1 bg-[#FCF9F5] border border-brand-gold/25 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2 text-xs placeholder:text-brand-charcoal/30 uppercase tracking-wide"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="bg-brand-maroon hover:bg-brand-terracotta text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-1 shadow-sm"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          প্রয়োগ
                        </button>
                      </div>
                      {couponError && <span className="block text-[10px] text-red-500 font-semibold">{couponError}</span>}
                    </div>
                  )}
                </div>

                {/* District specific Delivery Charge Guide */}
                <div className="bg-brand-cream/50 border border-brand-gold/10 rounded-2xl p-3.5 flex items-center justify-between text-xs text-brand-charcoal/70">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-brand-terracotta" />
                    <span>ডেলিভারি চার্জ:</span>
                  </div>
                  <span className="font-semibold text-brand-maroon">
                    {district === 'Dhaka' ? 'ঢাকা সিটি: ৳৬০' : 'ঢাকার বাইরে: ৳১২০'}
                  </span>
                </div>

                {/* Checkout Unified Form */}
                <form onSubmit={handleCheckoutSubmit} className="space-y-4 bg-white border border-brand-gold/10 p-5 rounded-2xl shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/50 border-b border-brand-gold/10 pb-2">
                    শিপিং ও পেমেন্ট তথ্য
                  </h3>
                  
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">পূর্ণ নাম: <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: নুসরাত জাহান"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#FCF9F5] border border-brand-gold/25 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2.5 text-xs placeholder:text-brand-charcoal/30"
                    />
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">মোবাইল নম্বর: <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      required
                      placeholder="যেমন: 017xxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#FCF9F5] border border-brand-gold/25 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2.5 text-xs placeholder:text-brand-charcoal/30 font-mono"
                    />
                  </div>

                  {/* District select */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">জেলা: <span className="text-red-500">*</span></label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value as any)}
                      className="w-full bg-[#FCF9F5] border border-brand-gold/25 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2.5 text-xs"
                    >
                      <option value="Dhaka">Dhaka (ঢাকা সিটি)</option>
                      <option value="Chittagong">Chittagong (চট্টগ্রাম)</option>
                      <option value="Sylhet">Sylhet (সিলেট)</option>
                      <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
                      <option value="Khulna">Khulna (খুলনা)</option>
                      <option value="Barisal">Barisal (বরিশাল)</option>
                      <option value="Rangpur">Rangpur (রংপুর)</option>
                      <option value="Mymensingh">Mymensingh (ময়মনসিংহ)</option>
                    </select>
                  </div>

                  {/* Address field */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">পূর্ণ ডেলিভারি ঠিকানা: <span className="text-red-500">*</span></label>
                    <textarea
                      required
                      rows={2}
                      placeholder="যেমন: বাসা ৪২, রোড ৭, ধানমন্ডি, ঢাকা"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-[#FCF9F5] border border-brand-gold/25 focus:border-brand-terracotta focus:outline-none rounded-xl px-3 py-2 text-xs placeholder:text-brand-charcoal/30 resize-none"
                    />
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-brand-charcoal/60 uppercase">পেমেন্ট মেথড:</label>
                    <div className="flex items-start gap-2.5 border border-brand-maroon/30 bg-brand-maroon/5 p-3 rounded-xl">
                      <Truck className="w-4 h-4 text-brand-maroon mt-0.5 flex-shrink-0" />
                      <div className="text-xs">
                        <p className="font-bold text-brand-maroon">ক্যাশ অন ডেলিভারি (Cash on Delivery)</p>
                        <p className="text-[10px] text-brand-charcoal/60 mt-0.5">পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন। বিকাশ/নগদ পেমেন্ট আপাতত বন্ধ রয়েছে।</p>
                      </div>
                    </div>
                  </div>

                  {/* Submit checkout order button */}
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-brand-gold hover:bg-[#B38F4B] disabled:bg-brand-charcoal/20 text-brand-maroon disabled:text-brand-charcoal/40 font-black py-3.5 px-5 rounded-full text-xs sm:text-sm transition-all duration-300 hover:scale-[1.01] shadow-lg flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-brand-maroon border-t-transparent rounded-full animate-spin" />
                          অর্ডার সাবমিট হচ্ছে...
                        </>
                      ) : (
                        `৳${total.toLocaleString('bn-BD')} পেমেন্ট ও অর্ডার নিশ্চিত করুন`
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}

          </div>

          {/* Drawer Footer Calculations (Always sticky when items are inside) */}
          {!checkoutSuccessOrder && cart.length > 0 && (
            <div className="px-5 py-5 border-t border-brand-gold/15 bg-white space-y-3.5 shadow-inner">
              <div className="space-y-1.5 text-xs text-brand-charcoal/70">
                <div className="flex justify-between">
                  <span>মোট পণ্যের দাম (Subtotal):</span>
                  <span>৳{subtotal.toLocaleString('bn-BD')}</span>
                </div>
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ:</span>
                  <span>৳{deliveryCharge.toLocaleString('bn-BD')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>কুপন ডিসকাউন্ট:</span>
                    <span>-৳{discount.toLocaleString('bn-BD')}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center pt-2.5 border-t border-brand-gold/10">
                <span className="text-sm font-bold text-brand-charcoal">সর্বমোট পরিশোধযোগ্য:</span>
                <span className="text-lg font-serif font-extrabold text-brand-maroon">
                  ৳{total.toLocaleString('bn-BD')}
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
