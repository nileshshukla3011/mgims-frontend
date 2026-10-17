import React from 'react';
import { Download, FileText } from 'lucide-react';
import { GenericPageContent } from '@/types';

/** Pulls "Label: value" pairs (e.g. "File size: 4.86 MB") from a report page's scraped lists. */
const reportMeta = (page: GenericPageContent) => {
  const meta: Record<string, string> = {};
  for (const l of page.lists ?? []) {
    for (const item of l.items) {
      const m = item.match(/^(Last update|File size|Downloaded):\s*(.+)$/i);
      if (m) meta[m[1].toLowerCase()] = m[2].trim();
    }
  }
  return meta;
};

/** Lists report pages (annual reports, audited statements, AQARs) with their real file details and a link to the official page. */
export const ReportList: React.FC<{ pages: Record<string, GenericPageContent>; keys: string[]; label: string }> = ({ pages, keys, label }) => {
  const reports = keys.map((k) => pages[k]).filter(Boolean);
  if (reports.length === 0) return null;

  return (
    <ul aria-label={label} className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
      {reports.map((r) => {
        const meta = reportMeta(r);
        return (
          <li key={r.url} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
            <div className="space-y-1">
              <p className="flex items-center gap-2 font-bold text-sm text-slate-900">
                <FileText className="w-4 h-4 text-link" aria-hidden="true" />
                {r.title}
              </p>
              {(meta['file size'] || meta['last update']) && (
                <p className="text-slate-600">
                  {meta['file size'] && <span>File size: {meta['file size']}</span>}
                  {meta['file size'] && meta['last update'] && <span aria-hidden="true"> · </span>}
                  {meta['last update'] && <span>Last updated: {meta['last update']}</span>}
                </p>
              )}
            </div>
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-11 inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-brand-blue px-3 text-xs font-semibold text-white hover:bg-blue-900"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>View report<span className="sr-only">: {r.title}</span></span>
            </a>
          </li>
        );
      })}
    </ul>
  );
};
