/**
 * The admin console is a separate app on its own port or host, so links to the public website need its full address:
 * VITE_PUBLIC_SITE_URL, or by default the local public dev server in development and the official site in a build.
 */
const configured: string | undefined = import.meta.env.VITE_PUBLIC_SITE_URL;

export const PUBLIC_SITE_URL = (configured || (import.meta.env.DEV ? 'http://localhost:5173' : 'https://www.mgims.ac.in')).replace(/\/$/, '');

export const publicSiteUrl = (path = '/') => `${PUBLIC_SITE_URL}${path}`;
