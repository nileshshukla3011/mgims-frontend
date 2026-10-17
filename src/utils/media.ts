// Photos and files from the old website (www.mgims.ac.in) can be served from the new hosting before the old site is
// switched off: copy them with `node scripts/download-media.mjs <folder>`, publish the folder, and set
// VITE_MEDIA_BASE_URL to its address. The path after the host stays the same; without the setting nothing changes.
const MEDIA_BASE = (import.meta.env.VITE_MEDIA_BASE_URL as string | undefined)?.trim().replace(/\/+$/, '');
const OLD_SITE = /^https?:\/\/(www\.)?mgims\.ac\.in\//i;

/** The address to load an old-site photo or file from. */
export const mediaUrl = (url: string) => (MEDIA_BASE && OLD_SITE.test(url) ? url.replace(OLD_SITE, `${MEDIA_BASE}/`) : url);
