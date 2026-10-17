import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible dialog: focus moves inside and stays there (Tab cycles), Esc or the close button closes it, and focus
 * returns to the control that opened it (UX4G modal pattern).
 */
export const Modal: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'md' | 'lg';
  /** Element id to focus first; defaults to the first focusable control. */
  initialFocusId?: string;
}> = ({ title, onClose, children, size = 'md', initialFocusId }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  // Callers often pass an inline onClose; keep the latest one without re-running the focus setup on each render.
  const onCloseRef = useRef(onClose);
  const initialFocusRef = useRef(initialFocusId);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const focusable = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? [],
      );
    requestAnimationFrame(() => {
      const first = initialFocusRef.current ? document.getElementById(initialFocusRef.current) : focusable().find((el) => !el.dataset.close);
      (first ?? focusable()[0])?.focus();
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
      }
      if (e.key === 'Tab') {
        const items = focusable();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      requestAnimationFrame(() => opener?.focus());
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`max-h-[90vh] w-full ${size === 'lg' ? 'max-w-3xl' : 'max-w-lg'} space-y-4 overflow-y-auto rounded-xl border border-slate-300 bg-white p-6 shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="font-serif text-lg font-bold text-ink">{title}</h2>
          <button
            type="button"
            data-close="true"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded text-slate-700 hover:bg-slate-100"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
