import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink } from 'lucide-react';

// UX4G 5.1.12: tell users before they leave the official site through an external link.
export const ExternalLinkNotice: React.FC = () => {
  const [target, setTarget] = useState<string | null>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const close = () => {
    setTarget(null);
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  };

  const proceed = () => {
    if (target) window.open(target, '_blank', 'noopener,noreferrer');
    close();
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      const anchor = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.dataset.externalConfirmed) return;
      const url = new URL(anchor.href, window.location.href);
      if (!/^https?:$/.test(url.protocol) || url.host === window.location.host) return;
      e.preventDefault();
      returnFocusRef.current = anchor;
      setTarget(url.href);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (!target) return;
    requestAnimationFrame(() => continueRef.current?.focus());
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [target]);

  if (!target) return null;

  return createPortal((
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="external-link-title"
        aria-describedby="external-link-desc"
        className="w-full max-w-md space-y-4 rounded-xl border border-slate-300 bg-white p-6 shadow-2xl"
      >
        <h2 id="external-link-title" className="flex items-center gap-2 text-base font-bold text-ink">
          <ExternalLink className="h-5 w-5 text-link" aria-hidden="true" />
          You are leaving the MGIMS portal
        </h2>
        <div id="external-link-desc" className="space-y-2 text-sm text-slate-700">
          <p>This link opens an external website in a new tab. MGIMS is not responsible for the content of external websites.</p>
          <p className="break-all rounded border border-slate-200 bg-slate-50 p-2 font-mono text-xs text-slate-700">{target}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={close} className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-100">
            Cancel
          </button>
          <button ref={continueRef} type="button" onClick={proceed} className="min-h-11 rounded-lg bg-brand-blue px-4 text-sm font-bold text-white hover:bg-blue-900">
            Continue to website
          </button>
        </div>
      </div>
    </div>
  ), document.body);
};
