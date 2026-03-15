import type { BookingState } from '../types/booking';

export function formatPrice(price: number): string {
  return `TWD ${price.toLocaleString()}`;
}

export function formatDate(d: string): string {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  return `${dt.getFullYear()}/${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}`;
}

export function formatDateParts(dateStr: string, locale: string = 'zh'): { month: string; day: string } {
  const d = new Date(dateStr);
  if (locale === 'en') {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return { month: months[d.getMonth()], day: `${d.getDate()}` };
  }
  return { month: `${d.getMonth() + 1}月`, day: `${d.getDate()}` };
}

export function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

export function truncateAddress(addr: string, max: number = 14): string {
  return addr.length > max ? addr.slice(0, max) + '...' : addr;
}

export function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function daysLabel(dateStr: string, locale: string = 'zh'): string {
  const days = daysUntil(dateStr);
  if (locale === 'en') {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === 2) return 'Day after tomorrow';
    return `in ${days} days`;
  }
  if (days === 0) return '今天';
  if (days === 1) return '明天';
  if (days === 2) return '後天';
  return `${days} 天後`;
}

export function stateLabel(state: BookingState, locale: string = 'zh'): string {
  if (locale === 'en') {
    const enMap: Record<BookingState, string> = {
      idle: 'Idle',
      pending: 'Finding Driver',
      assigned: 'Matched',
      'en-route': 'En Route',
      'in-progress': 'In Progress',
      completed: 'Completed',
    };
    return enMap[state];
  }
  const map: Record<BookingState, string> = {
    idle: '閒置',
    pending: '等待配對',
    assigned: '已配對',
    'en-route': '司機出發',
    'in-progress': '行程中',
    completed: '已完成',
  };
  return map[state];
}

export function stateColor(state: BookingState): {
  bg: string;
  text: string;
} {
  if (state === 'completed') return { bg: 'bg-teal-100', text: 'text-teal-700' };
  if (state === 'in-progress' || state === 'en-route')
    return { bg: 'bg-amber-100', text: 'text-amber-700' };
  if (state === 'assigned') return { bg: 'bg-teal-50', text: 'text-teal-700' };
  if (state === 'pending') return { bg: 'bg-navy-100', text: 'text-navy-600' };
  return { bg: 'bg-navy-50', text: 'text-navy-500' };
}
