import React from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { Eye, Sun, Moon, Globe, Settings2 } from 'lucide-react';
import { Language } from '@/types';
import { AccessibilitySettingsPanel } from '@/components/accessibility/AccessibilitySettings';

export const AccessibilityBar: React.FC = () => {
  const {
    fontSize,
    theme,
    language,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    setTheme,
    setLanguage,
    t,
  } = useAccessibility();

  const sizeButton = (active: boolean) =>
    `min-h-11 min-w-11 px-2 font-bold hover:text-amber-400 rounded transition ${active ? 'text-amber-400 bg-slate-700' : 'text-slate-300'}`;

  return (
    <div role="region" aria-label="Accessibility and language options" className="bg-brand-navy text-slate-200 text-xs py-1 px-4 border-b border-slate-700/60 select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left: skip link and owning organisation (MGIMS is run by Kasturba Health Society, not a government body) */}
        <div className="flex items-center gap-3">
          <a
            href="#main-content"
            className="skip-to-content font-medium focus:ring-2 focus:ring-amber-400"
          >
            {t('skip_to_content')}
          </a>
          <p className="flex items-center gap-2 text-slate-200">
            <span className="font-semibold text-amber-300">{t('society_name')}</span>
            <span className="hidden sm:inline text-slate-400" aria-hidden="true">|</span>
            <span className="hidden sm:inline">Sevagram, Wardha</span>
          </p>
        </div>

        {/* Right: accessibility controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-800/80 rounded px-1 border border-slate-700">
            <span className="text-[11px] text-slate-400 mr-1 hidden sm:inline">{t('font_size')}:</span>
            <button type="button" onClick={decreaseFontSize} className={sizeButton(fontSize === 'sm')} aria-label="Decrease text size" aria-pressed={fontSize === 'sm'}>
              A-
            </button>
            <button type="button" onClick={resetFontSize} className={sizeButton(fontSize === 'base')} aria-label="Normal text size" aria-pressed={fontSize === 'base'}>
              A
            </button>
            <button type="button" onClick={increaseFontSize} className={sizeButton(fontSize === 'lg' || fontSize === 'xl')} aria-label="Increase text size" aria-pressed={fontSize === 'lg' || fontSize === 'xl'}>
              A+
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 rounded px-1 border border-slate-700">
            <button
              type="button"
              onClick={() => setTheme(theme === 'contrast' ? 'light' : 'contrast')}
              className={`min-h-11 flex items-center gap-1 px-2 rounded transition ${theme === 'contrast' ? 'bg-amber-400 text-black font-bold' : 'text-slate-300 hover:text-amber-400'}`}
              aria-label="Toggle high contrast"
              aria-pressed={theme === 'contrast'}
            >
              <Eye className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t('high_contrast')}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`min-h-11 min-w-11 inline-flex items-center justify-center rounded transition ${theme === 'dark' ? 'text-amber-400' : 'text-slate-300 hover:text-white'}`}
              aria-label="Toggle dark mode"
              aria-pressed={theme === 'dark'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <Globe className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="min-h-11 bg-slate-800 text-slate-200 border border-slate-700 rounded px-1.5 text-xs focus:ring-1 focus:ring-amber-400 outline-none"
              aria-label="Select navigation language; page content may remain in English"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
            </select>
          </div>

          <details className="relative">
            <summary className="min-h-11 inline-flex cursor-pointer list-none items-center gap-1.5 rounded border border-slate-600 bg-slate-800 px-2 text-slate-100 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300">
              <Settings2 className="h-4 w-4" aria-hidden="true" /><span>Accessibility settings</span>
            </summary>
            <div className="absolute right-0 top-full z-[100] mt-2 w-[min(26rem,90vw)] rounded border border-slate-300 bg-white p-3 shadow-xl">
              <AccessibilitySettingsPanel />
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};
