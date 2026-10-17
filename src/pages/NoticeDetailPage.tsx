import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Eye, Download, ArrowLeft, FileText, ExternalLink } from 'lucide-react';
import { apiService } from '@/services/api';
import { NoticeItem } from '@/types';
import { OfficialContent } from '@/components/content/OfficialContent';
import { hasOfficialContent } from '@/utils/officialContent';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SkeletonRows } from '@/components/ui/Skeleton';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { noticeWindow } from '@/utils/noticeDates';
import { formatDate } from '@/utils/format';

export const NoticeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<NoticeItem | null>(null);
  const [loading, setLoading] = useState(true);
  usePageMeta(item ? item.title : 'Notice', item?.excerpt);

  useEffect(() => {
    async function fetchNotice() {
      if (!id) return;
      try {
        const n = await apiService.getNoticeById(parseInt(id, 10));
        if (n) setItem(n);
      } catch (err) {
        console.error('Error fetching notice:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotice();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8"><SkeletonRows count={6} label="Loading notice" /></div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Notice not found</h2>
        <p className="text-xs text-slate-500">The requested circular or notice could not be found.</p>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-link hover:underline">
          <ArrowLeft className="w-4 h-4" /> Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          to={item.category === 'Tender' ? '/tenders' : item.category === 'Recruitment' ? '/recruitment' : '/news'}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-link hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {item.category === 'Tender' ? 'Tenders' : item.category === 'Recruitment' ? 'Recruitment' : 'News'}
        </Link>
      </div>

      {/* Article Container */}
      <article className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 space-y-6 shadow-xs">
        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              item.category === 'Tender' ? 'bg-purple-100 text-purple-800' :
              item.category === 'Recruitment' ? 'bg-teal-100 text-teal-800' :
              item.category === 'Awards & Honors' ? 'bg-amber-100 text-amber-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {item.category}
            </span>
            <span className="text-slate-500 flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-600" /> {item.date}
            </span>
          </div>

          {item.hits && (
            <div className="text-slate-600 font-mono text-[11px] flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{item.hits} views</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-ink font-serif leading-tight">
          {item.title}
        </h1>

        {/* Expired notices leave the lists but keep their address, so existing links still work (WEB-CMS-6). */}
        {noticeWindow(item) === 'expired' && (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm text-slate-700">
            This notice was removed from the notice lists on {formatDate(item.expires_at)}. It is kept here for reference.
          </p>
        )}

        {/* Article Body */}
        <div className="max-w-[75ch] text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 pt-2">
          {item.paragraphs && item.paragraphs.length > 0 ? (
            item.paragraphs.map((para, idx) => (
              <p key={idx} className="leading-relaxed">
                {para}
              </p>
            ))
          ) : (
            <p className="whitespace-pre-line leading-relaxed">{item.text}</p>
          )}
        </div>

        {/* Lists, tables and photos captured from the official notice */}
        {hasOfficialContent({ ...item, paragraphs: [] }) && (
          <OfficialContent page={{ ...item, paragraphs: [] }} showHeading={false} />
        )}

        {/* Document Attachments if present */}
        {item.doc_links && item.doc_links.length > 0 && (
          <div className="pt-6 border-t border-slate-200 space-y-3 bg-slate-50 p-4 rounded-xl">
            <h3 className="font-bold text-xs tracking-wider text-ink flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-link" />
              Official attached documents & forms:
            </h3>
            <div className="space-y-2">
              {item.doc_links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-brand-blue hover:text-link text-xs font-semibold transition"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-amber-800" />
                    <span>{link.text || 'Download Tender / Application Document'}</span>
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono">PDF / DOC</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {item.doc_links.length === 0 && item.attachments_url && (
          <div className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm text-slate-700">
            <FileText className="h-5 w-5 shrink-0 text-link" aria-hidden="true" />
            <p>
              Forms and documents attached to this notice are available on the official MGIMS website.{' '}
              <a href={item.attachments_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-link hover:underline">
                Open the notice with its attachments <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </p>
          </div>
        )}

        <ShareButtons title={item.title} />

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <p>Published by Mahatma Gandhi Institute of Medical Sciences, Sevagram</p>
          <span className="text-[11px] text-slate-600 font-mono">Reference ID: #{item.id}</span>
        </div>
      </article>
    </div>
  );
};
