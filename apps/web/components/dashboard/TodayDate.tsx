'use client';
// Date du jour calculée côté client (après montage) : pas de décalage d'hydratation
// entre le HTML pré-rendu au build et le navigateur.

import { useEffect, useState } from 'react';
import { fmtLongDate, fmtMonthYear, fmtShortDate } from '@/lib/format';

export function useToday() {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => setToday(new Date()), []);
  return today;
}

export function TodayDate({ format = 'long' }: { format?: 'long' | 'short' | 'month' }) {
  const today = useToday();
  if (!today) return <span suppressHydrationWarning>&nbsp;</span>;
  const text = format === 'short' ? fmtShortDate(today) : format === 'month' ? fmtMonthYear(today) : fmtLongDate(today);
  return <time dateTime={today.toISOString().slice(0, 10)}>{text}</time>;
}
