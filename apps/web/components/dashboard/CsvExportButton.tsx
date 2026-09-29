'use client';

import { Download } from 'lucide-react';
import { csvDateStamp, downloadCsv, type CsvCell } from '@/lib/csv';

interface CsvExportButtonProps {
  /** Nom de fichier sans extension ; la date du jour est ajoutée. */
  filename: string;
  headers: string[];
  rows: CsvCell[][];
  label?: string;
  className?: string;
  style?: React.CSSProperties;
  icon?: boolean;
}

export function CsvExportButton({
  filename, headers, rows, label = 'Exporter CSV', className = 'btn-secondary', style, icon = true,
}: CsvExportButtonProps) {
  return (
    <button
      type="button"
      className={className}
      style={style}
      disabled={rows.length === 0}
      title={rows.length === 0 ? 'Aucune ligne à exporter' : `${rows.length} ligne(s)`}
      onClick={() => downloadCsv(`${filename}-${csvDateStamp()}.csv`, headers, rows)}
    >
      {icon ? <Download aria-hidden="true" /> : '↓ '}
      {label}
    </button>
  );
}
