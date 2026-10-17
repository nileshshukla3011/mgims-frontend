// Merges the [English, Hindi, Marathi] string tables of the online services into one table per language.
import { commonStrings, Triple } from '@/i18n/services/common';
import { portalStrings } from '@/i18n/services/portals';
import { publicStrings } from '@/i18n/services/public';

const all = { ...commonStrings, ...portalStrings, ...publicStrings };

/** Every key of the service string tables. */
export type ServiceKey = keyof typeof all;
const pick = (index: 0 | 1 | 2): Record<string, string> =>
  Object.fromEntries(Object.entries(all as Record<string, Triple>).map(([key, triple]) => [key, triple[index]]));

export const serviceStrings = { en: pick(0), hi: pick(1), mr: pick(2) };
