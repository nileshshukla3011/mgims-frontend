import { useEffect } from 'react';

const SITE_NAME = 'MGIMS Sevagram';
const DEFAULT_TITLE = 'Mahatma Gandhi Institute of Medical Sciences';
const DEFAULT_DESCRIPTION =
  'Mahatma Gandhi Institute of Medical Sciences (MGIMS), Sevagram, Wardha and Kasturba Hospital — rural medical college and teaching hospital run by Kasturba Health Society.';

/** Returns the <head> tag matching `selector`, creating it on first use. */
const headTag = (selector: string, create: () => HTMLElement) => document.head.querySelector(selector) ?? document.head.appendChild(create());

const setMeta = (attribute: 'name' | 'property', key: string, content: string) =>
  headTag(`meta[${attribute}="${key}"]`, () => {
    const meta = document.createElement('meta');
    meta.setAttribute(attribute, key);
    return meta;
  }).setAttribute('content', content);

/**
 * Sets a page-specific <title> and meta description (UX4G 5.3.11, 6.16), plus the canonical address and Open Graph
 * tags that search engines and link previews read (WEB-IA-6). Pages marked noindex (the admin console) get neither.
 */
export const usePageMeta = (title?: string, description?: string, options: { noindex?: boolean } = {}) => {
  // Read while rendering, so a route change that keeps the same title still updates the canonical address.
  const path = window.location.pathname;
  const { noindex = false } = options;
  useEffect(() => {
    const text = (description || DEFAULT_DESCRIPTION).slice(0, 160);
    document.title = title ? `${title} | ${SITE_NAME}` : `${DEFAULT_TITLE} | ${SITE_NAME}`;
    setMeta('name', 'description', text);
    // A page that must stay out of search results (e.g. "page not found", which the server answers with 200): tell
    // search engines so while it is shown, and give it no canonical address.
    if (noindex) {
      const robots = headTag('meta[name="robots"]', () => {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'robots');
        meta.dataset.page = 'true';
        return meta;
      });
      robots.setAttribute('content', 'noindex');
      document.head.querySelector('link[rel="canonical"]')?.remove();
      return () => {
        if (robots instanceof HTMLElement && robots.dataset.page) robots.remove();
      };
    }
    if (document.querySelector('meta[name="robots"][content*="noindex"]')) return;
    const url = `${__SITE_URL__}${path.replace(/\/+$/, '') || '/'}`;
    headTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' })).setAttribute('href', url);
    setMeta('property', 'og:title', title ?? DEFAULT_TITLE);
    setMeta('property', 'og:description', text);
    setMeta('property', 'og:url', url);
  }, [title, description, path, noindex]);
};
