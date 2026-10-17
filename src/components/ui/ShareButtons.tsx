import React, { useState } from 'react';
import { Check, Link2, Share2 } from 'lucide-react';

/** Share a page via the device share sheet, WhatsApp, X or a copied link (UX4G 6.1.6). */
export const ShareButtons: React.FC<{ title: string }> = ({ title }) => {
  const [copied, setCopied] = useState(false);
  const url = window.location.href;
  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;
  const btn = 'min-h-11 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 hover:bg-slate-50';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Share this notice">
      {canNativeShare ? (
        <button type="button" onClick={() => navigator.share({ title, url }).catch(() => undefined)} className={btn}>
          <Share2 className="h-4 w-4" aria-hidden="true" /> Share
        </button>
      ) : (
        <>
          <a className={btn} target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}>
            Share on WhatsApp
          </a>
          <a className={btn} target="_blank" rel="noopener noreferrer" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}>
            Share on X
          </a>
        </>
      )}
      <button type="button" onClick={copy} className={btn}>
        {copied ? <Check className="h-4 w-4 text-emerald-700" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
        <span aria-live="polite">{copied ? 'Link copied' : 'Copy link'}</span>
      </button>
    </div>
  );
};
