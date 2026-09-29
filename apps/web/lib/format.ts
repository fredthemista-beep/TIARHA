// apps/web/lib/format.ts
// Formatage fr-FR sans dépendance au fuseau horaire : une date ISO 'YYYY-MM-DD'
// est lue telle quelle, pour que le rendu serveur et le rendu client soient identiques.

export function fmtEuro(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

/** '2026-07-01' → '01/07/2026' */
export function fmtDateFr(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Date du jour en toutes lettres : « Mardi 29 septembre 2026 ». */
export function fmtLongDate(date: Date) {
  const s = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Date du jour courte : « 29/09/2026 ». */
export function fmtShortDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

/** Mois et année : « Septembre 2026 ». */
export function fmtMonthYear(date: Date) {
  const s = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date);
  return s.charAt(0).toUpperCase() + s.slice(1);
}
