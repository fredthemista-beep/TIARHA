// apps/web/lib/csv.ts
// Export CSV lisible par Excel FR : UTF-8 avec BOM, séparateur « ; », virgule décimale.

export type CsvCell = string | number | boolean | null | undefined;

function formatCell(value: CsvCell): string {
  if (value === null || value === undefined) return '';
  let s: string;
  if (typeof value === 'number') {
    s = Number.isInteger(value) ? String(value) : value.toFixed(2).replace('.', ',');
  } else if (typeof value === 'boolean') {
    s = value ? 'Oui' : 'Non';
  } else {
    s = value;
  }
  return /[";\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(headers: string[], rows: CsvCell[][]): string {
  return [headers, ...rows].map(row => row.map(formatCell).join(';')).join('\r\n');
}

/** Déclenche le téléchargement d'un fichier CSV dans le navigateur. */
export function downloadCsv(filename: string, headers: string[], rows: CsvCell[][]) {
  const blob = new Blob(['﻿' + toCsv(headers, rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Suffixe de nom de fichier daté : 2026-09-29. */
export function csvDateStamp(date = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}
