import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Accessibility, Eye, Moon, RotateCcw, Sun, Volume2, X } from 'lucide-react';
import { useAccessibility } from '@/context/AccessibilityContext';

// Options from the UX4G Accessibility Widget; each toggles a body class styled in index.css.
const WIDGET_OPTIONS: [string, string][] = [
  ['line-spacing', 'Increase line spacing'],
  ['highlight-links', 'Highlight links'],
  ['text-spacing', 'Increase text spacing'],
  ['dyslexia-friendly', 'Dyslexia-friendly font'],
  ['hide-images', 'Hide images'],
  ['large-cursor', 'Enlarge cursor'],
  ['invert-colors', 'Invert colours'],
];

const optionClass = (on: boolean) =>
  `min-h-11 rounded border px-3 py-2 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600 ${
    on ? 'border-blue-800 bg-blue-50 font-semibold text-blue-900' : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
  }`;

/** All accessibility controls; used in the top bar and in the floating widget. */
export const AccessibilitySettingsPanel: React.FC<{ onNavigate?: () => void }> = ({ onNavigate }) => {
  const { fontSize, theme, increaseFontSize, decreaseFontSize, resetFontSize, setTheme, toggles, setToggle, resetAll } = useAccessibility();

  return (
    <div className="space-y-3 text-slate-800">
      <fieldset className="space-y-1">
        <legend className="text-xs font-bold text-slate-600">Text size</legend>
        <div className="grid grid-cols-3 gap-1">
          <button type="button" onClick={decreaseFontSize} aria-pressed={fontSize === 'sm'} className={optionClass(fontSize === 'sm')}>Smaller text</button>
          <button type="button" onClick={resetFontSize} aria-pressed={fontSize === 'base'} className={optionClass(fontSize === 'base')}>Normal text</button>
          <button type="button" onClick={increaseFontSize} aria-pressed={fontSize === 'lg' || fontSize === 'xl'} className={optionClass(fontSize === 'lg' || fontSize === 'xl')}>Bigger text</button>
        </div>
      </fieldset>

      <fieldset className="space-y-1">
        <legend className="text-xs font-bold text-slate-600">Colour theme</legend>
        <div className="grid grid-cols-3 gap-1">
          <button type="button" onClick={() => setTheme('light')} aria-pressed={theme === 'light'} className={`${optionClass(theme === 'light')} inline-flex items-center gap-1.5`}>
            <Sun className="h-4 w-4" aria-hidden="true" /> Light
          </button>
          <button type="button" onClick={() => setTheme('dark')} aria-pressed={theme === 'dark'} className={`${optionClass(theme === 'dark')} inline-flex items-center gap-1.5`}>
            <Moon className="h-4 w-4" aria-hidden="true" /> Dark
          </button>
          <button type="button" onClick={() => setTheme('contrast')} aria-pressed={theme === 'contrast'} className={`${optionClass(theme === 'contrast')} inline-flex items-center gap-1.5`}>
            <Eye className="h-4 w-4" aria-hidden="true" /> High contrast
          </button>
        </div>
      </fieldset>

      <fieldset className="space-y-1">
        <legend className="text-xs font-bold text-slate-600">Reading aids</legend>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {WIDGET_OPTIONS.map(([className, label]) => (
            <button
              key={className}
              type="button"
              onClick={() => setToggle(className, !toggles[className])}
              aria-pressed={Boolean(toggles[className])}
              className={optionClass(Boolean(toggles[className]))}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
        <Link
          to="/screen-reader-access"
          onClick={onNavigate}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-link hover:underline"
        >
          <Volume2 className="h-4 w-4" aria-hidden="true" /> Screen reader access
        </Link>
        <button
          type="button"
          onClick={resetAll}
          className="inline-flex min-h-11 items-center gap-1.5 rounded border border-slate-300 px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset all
        </button>
      </div>
    </div>
  );
};

/** Sticky accessibility button at the bottom-right of the viewport (UX4G 6.5.4). */
export const FloatingAccessibilityWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('button, a')?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div data-print-hide className="fixed bottom-4 right-4 z-[55] flex flex-col items-end gap-2">
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="a11y-widget-title"
          className="w-[min(26rem,calc(100vw-2rem))] max-h-[75vh] overflow-y-auto rounded-xl border border-slate-300 bg-white p-4 shadow-2xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 id="a11y-widget-title" className="text-base font-bold text-ink">Accessibility options</h2>
            <button
              type="button"
              onClick={() => { setOpen(false); buttonRef.current?.focus(); }}
              aria-label="Close accessibility options"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-slate-700 hover:bg-slate-100"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <AccessibilitySettingsPanel onNavigate={() => setOpen(false)} />
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Accessibility options"
        className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-brand-blue text-white shadow-lg hover:bg-brand-navy"
      >
        <Accessibility className="h-7 w-7" aria-hidden="true" />
      </button>
    </div>
  );
};
