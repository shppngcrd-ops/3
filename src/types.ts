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
