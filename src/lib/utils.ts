import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(num);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffInHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInHours * 60);
    return diffInMinutes <= 0 ? 'Just now' : `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (diffInHours < 24 * 7) {
    const days = Math.floor(diffInHours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  } else {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

export function getPaymentMethodIcon(method: string): string {
  switch (method.toLowerCase()) {
    case 'credit_card':
      return 'fas fa-credit-card';
    case 'upi':
      return 'fas fa-mobile-alt';
    case 'gift_card':
      return 'fas fa-gift';
    case 'cash':
      return 'fas fa-money-bill';
    case 'online_payment':
      return 'fas fa-globe';
    default:
      return 'fas fa-money-bill';
  }
}

export function getCategoryIcon(category: string): string {
  switch (category.toLowerCase()) {
    case 'food':
      return 'fas fa-utensils';
    case 'gift':
      return 'fas fa-gift';
    case 'recharge':
      return 'fas fa-mobile-alt';
    case 'bill':
      return 'fas fa-file-invoice';
    default:
      return 'fas fa-shopping-bag';
  }
}
