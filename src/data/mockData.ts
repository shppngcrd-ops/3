import { Product, Order, Coupon } from '../types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coup-1',
    code: 'BORNO10',
    discountPercent: 10,
    description: '১০% বিশেষ ছাড় সব পণ্যে!',
    active: true
  },
  {
    id: 'coup-2',
    code: 'FREE60',
    discountPercent: 100,
    description: 'ফ্রি ডেলিভারি কুপন কোড',
    active: true
  }
];

// Analytics for the charts (starts clean or simple)
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
