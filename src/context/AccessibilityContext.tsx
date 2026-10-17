import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';
import { AccessibilitySettings, FontSize, Theme, Language } from '@/types';
import { translations, TranslationKey } from '@/i18n/translations';
import { setRequestLanguage } from '@/services/http';

interface AccessibilityContextType extends AccessibilitySettings {
  setFontSize: (size: FontSize) => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  /** Extra widget options (line spacing, highlight links, ...) keyed by the body class they toggle. */
  toggles: Record<string, boolean>;
  setToggle: (className: string, enabled: boolean) => void;
  resetAll: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  /** UI string in the chosen language (falls back to English); `{name}` placeholders are filled from `params`. */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}


const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

// Preferences are remembered per browser (UX4G 6.4.2). Storage can be unavailable (private mode), so every access is guarded.
const STORAGE_KEY = 'mgims-accessibility';
interface StoredPrefs { fontSize?: FontSize; theme?: Theme; language?: Language; toggles?: Record<string, boolean> }
const loadPrefs = (): StoredPrefs => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};
const savePrefs = (prefs: StoredPrefs) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Preferences simply won't persist.
  }
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initial] = useState(loadPrefs);
  const [fontSize, setFontSizeState] = useState<FontSize>(initial.fontSize ?? 'base');
  const [theme, setThemeState] = useState<Theme>(initial.theme ?? 'light');
  const [language, setLanguageState] = useState<Language>(initial.language ?? 'en');
  const [toggles, setToggles] = useState<Record<string, boolean>>(initial.toggles ?? {});

  useEffect(() => {
    savePrefs({ fontSize, theme, language, toggles });
  }, [fontSize, theme, language, toggles]);

  useEffect(() => {
    for (const [className, enabled] of Object.entries(toggles)) {
      document.body.classList.toggle(className, enabled);
    }
  }, [toggles]);

  useEffect(() => {
    // Root sizing also scales Tailwind's rem-based text utilities.
    document.documentElement.classList.remove('font-sm', 'font-base', 'font-lg', 'font-xl');
    document.documentElement.classList.add(`font-${fontSize}`);
  }, [fontSize]);

  // Keep the document language in sync so screen readers pronounce Hindi/Marathi labels correctly, and ask the backend
  // for content in the same language (WEB-MLS-3). A layout effect, so the saved language is set before the pages'
  // first requests: their (passive) effects run after it, while a parent's passive effect would run after theirs.
  useLayoutEffect(() => {
    document.documentElement.lang = language;
    setRequestLanguage(language);
  }, [language]);

  useEffect(() => {
    // Apply contrast class to body
    document.body.classList.remove('high-contrast', 'dark');
    if (theme === 'contrast') {
      document.body.classList.add('high-contrast');
    } else if (theme === 'dark') {
      document.body.classList.add('dark');
    }
  }, [theme]);

  const setFontSize = (size: FontSize) => setFontSizeState(size);
  const setTheme = (t: Theme) => setThemeState(t);
  const setLanguage = (lang: Language) => setLanguageState(lang);

  const increaseFontSize = () => {
    if (fontSize === 'sm') setFontSizeState('base');
    else if (fontSize === 'base') setFontSizeState('lg');
    else if (fontSize === 'lg') setFontSizeState('xl');
  };

  const decreaseFontSize = () => {
    if (fontSize === 'xl') setFontSizeState('lg');
    else if (fontSize === 'lg') setFontSizeState('base');
    else if (fontSize === 'base') setFontSizeState('sm');
  };

  const resetFontSize = () => setFontSizeState('base');

  const setToggle = (className: string, enabled: boolean) =>
    setToggles((current) => ({ ...current, [className]: enabled }));

  const resetAll = () => {
    setFontSizeState('base');
    setThemeState('light');
    setToggles((current) => Object.fromEntries(Object.keys(current).map((k) => [k, false])));
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = translations[language][key] || translations['en'][key] || key;
    if (params) for (const [name, value] of Object.entries(params)) text = text.split(`{${name}}`).join(String(value));
    return text;
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        theme,
        language,
        setFontSize,
        setTheme,
        setLanguage,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        toggles,
        setToggle,
        resetAll,
        t,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
