/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Order, Coupon } from '../types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_COUPONS: Coupon[] = [];

// Mock analytics for the charts
export const WEEKLY_SALES_HISTORY = [
  { day: 'রবিবার', sales: 0, orders: 0 },
  { day: 'সোমবার', sales: 0, orders: 0 },
  { day: 'মঙ্গলবার', sales: 0, orders: 0 },
  { day: 'বুধবার', sales: 0, orders: 0 },
  { day: 'বৃহস্পতিবার', sales: 0, orders: 0 },
  { day: 'শুক্রবার', sales: 0, orders: 0 },
  { day: 'শনিবার', sales: 0, orders: 0 }
];

export const CATEGORY_SALES: { name: string; value: number }[] = [];
