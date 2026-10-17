import { saveBlob } from '@/utils/download';

/** CSV text with quoting, plus a byte-order mark so Excel opens Hindi / Marathi text correctly. */
export const toCsv = (rows: (string | number | undefined | null)[][]) =>
  '﻿' +
  rows
    .map((row) =>
      row
        .map((cell) => {
          const text = cell === undefined || cell === null ? '' : String(cell);
          // A leading = + - @ would run as a formula in spreadsheet apps (CSV injection).
          const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
          return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
        })
        .join(','),
    )
    .join('\r\n');

export const downloadCsv = (fileName: string, rows: (string | number | undefined | null)[][]) =>
  saveBlob(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }), fileName);
