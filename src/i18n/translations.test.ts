import { describe, expect, it } from 'vitest';
import { translations } from '@/i18n/translations';

const placeholders = (text = '') => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
const others = ['hi', 'mr'] as const;

describe('translations (WEB-MLS-1)', () => {
  it('has every English text in Hindi and Marathi, none empty', () => {
    for (const lang of others) for (const key of Object.keys(translations.en)) expect(translations[lang][key]?.trim(), `${lang}: ${key}`).toBeTruthy();
  });
  it('keeps the same {placeholders} in every language', () => {
    for (const [key, english] of Object.entries(translations.en)) for (const lang of others) expect(placeholders(translations[lang][key]), `${lang}: ${key}`).toBe(placeholders(english));
  });
});
