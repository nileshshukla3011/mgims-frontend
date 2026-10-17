import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';

export interface GalleryPhoto {
  url: string;
  /** Caption of the official page (its alt text or title), if it has one. */
  caption?: string;
}

const STEP = 12;

/**
 * Photos as a grid of thumbnails with their captions. Selecting one opens it large in a dialog, with its caption,
 * previous / next (buttons or arrow keys) and Close (button, Escape or a click outside the photo). Focus returns to
 * the thumbnail when the dialog closes.
 */
export const PhotoGallery: React.FC<{
  photos: GalleryPhoto[];
  label: string;
  /** Beside text: all photos in a two-column strip on wide screens, one swipeable row on phones. */
  beside?: boolean;
}> = ({ photos, label, beside = false }) => {
  const { t } = useAccessibility();
  const [limit, setLimit] = useState(beside ? photos.length : STEP);
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const lastOpened = useRef(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open !== null && !dialog.open) dialog.showModal();
    if (open === null && dialog.open) dialog.close();
  }, [open]);

  const show = (i: number) => {
    lastOpened.current = i;
    setOpen((i + photos.length) % photos.length);
  };
  const name = (i: number) => photos[i].caption || t('gallery.photo', { n: i + 1, total: photos.length });
  const current = open === null ? undefined : photos[open];

  return (
    <div className="space-y-3">
      <ul className={beside ? 'flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-2 lg:overflow-visible lg:pb-0' : 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'}>
        {photos.slice(0, limit).map((photo, i) => (
          <li key={photo.url} className={beside ? 'w-40 shrink-0 snap-start sm:w-48 lg:w-auto' : undefined}>
            <figure className="space-y-1.5">
              <button
                type="button"
                ref={(el) => {
                  thumbs.current[i] = el;
                }}
                onClick={() => show(i)}
                className="group block w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
              >
                <img
                  src={photo.url}
                  alt={`${t('gallery.open')}: ${name(i)}`}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
                />
              </button>
              {photo.caption && <figcaption aria-hidden="true" className="text-xs leading-snug text-slate-600">{photo.caption}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>
      {photos.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((n) => n + STEP * 3)}
          className="min-h-11 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-link hover:bg-slate-50"
        >
          {t('gallery.more', { count: photos.length - limit })}
        </button>
      )}

      <dialog
        ref={dialogRef}
        aria-label={current ? name(open!) : label}
        onClose={() => {
          setOpen(null);
          thumbs.current[lastOpened.current]?.focus();
        }}
        onClick={(e) => e.target === e.currentTarget && setOpen(null)}
        onKeyDown={(e) => {
          if (open === null) return;
          if (e.key === 'ArrowLeft') show(open - 1);
          if (e.key === 'ArrowRight') show(open + 1);
        }}
        className="m-auto w-[min(96vw,1100px)] overflow-hidden rounded-2xl bg-slate-950 p-0 text-white backdrop:bg-black/80"
      >
        {current && open !== null && (
          <div className="flex max-h-[95vh] flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-2">
              <p className="text-sm text-slate-200">{t('gallery.count', { n: open + 1, total: photos.length })}</p>
              <button type="button" onClick={() => setOpen(null)} aria-label={t('gallery.close')} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/15">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
              <img src={current.url} alt={current.caption ?? ''} className="max-h-[75vh] w-auto max-w-full object-contain" />
              {photos.length > 1 && (
                <>
                  <button type="button" onClick={() => show(open - 1)} aria-label={t('gallery.prev')} className="absolute left-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/60 hover:bg-black/80">
                    <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => show(open + 1)} aria-label={t('gallery.next')} className="absolute right-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/60 hover:bg-black/80">
                    <ChevronRight className="h-6 w-6" aria-hidden="true" />
                  </button>
                </>
              )}
            </div>
            {current.caption && <p className="px-4 py-3 text-sm text-slate-100">{current.caption}</p>}
          </div>
        )}
      </dialog>
    </div>
  );
};
