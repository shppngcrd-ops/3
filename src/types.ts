/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  originalPrice: number;
  resellPrice: number;
  condition: 'like-new' | 'excellent' | 'good' | 'fair';
  description: string;
  images: string[];
  category: string;
  size: string[];
  color: string[];
  stock: number;
  sellerName: string;
  sellerAvatar?: string;
  rating: number;
  reviews: Review[];
  isBestSeller?: boolean;
  isNew?: boolean;
  brand?: string;
  dateAdded: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  district: 'Dhaka' | 'Chittagong' | 'Sylhet' | 'Rajshahi' | 'Khulna' | 'Barisal' | 'Rangpur' | 'Mymensingh';
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
    image: string;
  }[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  trackingCode?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  description: string;
  active: boolean;
}

export interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockItems: number;
}

export const PRODUCT_CATEGORIES = [
  'ওয়ার্ল্ড কাপ',
  'পলো শার্ট',
  'ড্রপসোল্ডার টিশার্ট',
  'বেসিক টিশার্ট',
  'লং-স্লীভ টিশার্ট',
  'প্রিন্ট শার্ট',
  'সলিড শার্ট',
  'চেক শার্ট',
  'শার্ট কম্বো',
  'শর্ট কম্বো',
  'হাফ স্লিভ সেট',
  'লং স্লিভ সেট',
  'এমব্রো. পাঞ্জাবি',
  'প্রিন্ট পাঞ্জাবি',
  'পাঞ্জাবি কম্বো',
  'রেডিমেড থ্রিপিস',
  'আনস্টিজ থ্রিপিস',
  'গাউন & কুর্তি',
  'লেহেঙ্গা & পার্টি',
  'ওয়েস্টার্ন ড্রেস',
  'টিশার্ট & স্কার্ট',
  'হ্যান্ডপ্রিন্ট শাড়ি',
  'ইন্ডিয়ান শাড়ী',
  'তাঁতের শাড়ী',
  'বোরকা',
  'হিজাব & নিকাব',
  'সুন্নাতি ড্রেস',
  'কাপল শাড়ী',
  'কাপল থ্রীপিস',
  'বেডশীট',
  'পার্স ব্যাগ',
  'মেয়েদের ব্যাগ',
  'জেন্টস হুডি',
  'জেন্টস জ্যাকেট',
  'হুডি সেট',
  'সুয়েটার',
  'লেডিস হুডি',
  'লেডিস জ্যাকেট',
  'লেডিস ওভারকোট',
  'জুতা',
  'বেবি উইন্টার ড্রেসসমূহ',
  'লেডিস উইন্টার এক্সেসরিজ'
];
