import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';
import photo1 from '@/assets/images/hero/heritage-1-1920.webp';
import photo1Small from '@/assets/images/hero/heritage-1-960.webp';
import photo2 from '@/assets/images/hero/heritage-2-1920.webp';
import photo2Small from '@/assets/images/hero/heritage-2-960.webp';
import photo3 from '@/assets/images/hero/heritage-3-1920.webp';
import photo3Small from '@/assets/images/hero/heritage-3-960.webp';
import photo4 from '@/assets/images/hero/heritage-4-1920.webp';
import photo4Small from '@/assets/images/hero/heritage-4-960.webp';
import photo5 from '@/assets/images/hero/heritage-5-1920.webp';
import photo5Small from '@/assets/images/hero/heritage-5-960.webp';
import photo6 from '@/assets/images/hero/heritage-6-1920.webp';
import photo6Small from '@/assets/images/hero/heritage-6-960.webp';

// Archive photos behind the home page banner, each in two widths. `position` keeps the people in view when the
// photo is cropped to the banner's shape.
const PHOTOS = [
  { large: photo1, small: photo1Small, width: 1672, position: 'object-center' },
  { large: photo2, small: photo2Small, width: 1920, position: 'object-[center_30%]' },
  { large: photo3, small: photo3Small, width: 1920, position: 'object-center' },
  { large: photo4, small: photo4Small, width: 1749, position: 'object-center' },
  { large: photo5, small: photo5Small, width: 1373, position: 'object-[center_35%]' },
  { large: photo6, small: photo6Small, width: 1752, position: 'object-center' },
];
const INTERVAL_MS = 7000;

const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * The home page banner with a slideshow of archive photos behind its content. The photos are decoration (the banner's
 * text does not change), so they have no text alternative. They change every 7 seconds and the slideshow follows
 * WCAG 2.2.2: it can be paused, it waits while the pointer or keyboard focus is in the banner and while the tab is
 * hidden, and it does not start at all when the visitor's system asks for reduced motion.
 */
export const HeroSlideshow: React.FC<{ children: React.ReactNode; labelledBy: string }> = ({ children, labelledBy }) => {
  const { t } = useAccessibility();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(prefersReducedMotion);
  const [interacting, setInteracting] = useState(false);
  const [hidden, setHidden] = useState(false);
  // Photos are added to the page when first needed (the current one and the next), so a visit downloads only those.
  const [loaded, setLoaded] = useState(() => new Set([0, 1]));

  const show = useCallback((next: number) => {
    const i = (next + PHOTOS.length) % PHOTOS.length;
    setIndex(i);
    setLoaded((s) => (s.has(i) && s.has((i + 1) % PHOTOS.length) ? s : new Set([...s, i, (i + 1) % PHOTOS.length])));
  }, []);

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (paused || interacting || hidden) return;
    const timer = window.setTimeout(() => show(index + 1), INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [index, paused, interacting, hidden, show]);

  const control = 'inline-flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/20';
  return (
    <section
      aria-labelledby={labelledBy}
      className="relative isolate overflow-hidden border-b-4 border-amber-500 bg-brand-navy text-white"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setInteracting(false)}
    >
      {PHOTOS.map((photo, i) =>
        loaded.has(i) ? (
          <img
            key={photo.large}
            src={photo.large}
            srcSet={`${photo.small} 960w, ${photo.large} ${photo.width}w`}
            sizes="100vw"
            alt=""
            decoding="async"
            fetchPriority={i === 0 ? 'high' : 'low'}
            className={`absolute inset-0 -z-20 h-full w-full object-cover ${photo.position} motion-safe:transition-opacity motion-safe:duration-1000 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : null,
      )}
      {/* A light tint only, so the photos stay visible; the banner's text and card have their own dark panels. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-navy/70 via-brand-navy/15 to-brand-navy/25" />

      {children}

      <div className="mx-auto flex max-w-7xl justify-end px-4 pb-4">
        <div role="group" aria-label={t('hero.photos')} className="flex items-center gap-0.5 rounded-full border border-white/20 bg-brand-navy/70 p-1 backdrop-blur-sm">
          <button type="button" onClick={() => show(index - 1)} aria-label={t('hero.prev')} className={control}>
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          {PHOTOS.map((photo, i) => (
            <button
              key={photo.large}
              type="button"
              onClick={() => show(i)}
              aria-label={t('hero.photo', { n: i + 1, total: PHOTOS.length })}
              aria-current={i === index ? 'true' : undefined}
              className="inline-flex h-11 w-6 items-center justify-center"
            >
              <span aria-hidden="true" className={`block h-2 rounded-full motion-safe:transition-all ${i === index ? 'w-5 bg-amber-400' : 'w-2 bg-white/60 hover:bg-white'}`} />
            </button>
          ))}
          <button type="button" onClick={() => show(index + 1)} aria-label={t('hero.next')} className={control}>
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => setPaused((p) => !p)} aria-label={paused ? t('hero.play') : t('hero.pause')} className={control}>
            {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </section>
  );
};
