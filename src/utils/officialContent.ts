import { GenericPageContent, ImageItem, ListItem, ScrapedTable } from '@/types';
import { mediaUrl } from '@/utils/media';

export type { ScrapedTable };

// Images that appear on every scraped page (site header, logo, banner) or are CMS placeholders.
const SITE_CHROME_IMAGES = [
  '/images/header.png',
  '/images/logo_sm.png',
  '/images/mp/shs1.jpg',
  'placeholder-image.png',
];

export type OfficialPage = Pick<GenericPageContent, 'title' | 'url' | 'paragraphs' | 'images'> & {
  tables?: ScrapedTable[];
  lists?: ListItem[];
};

export const contentImages = (images: ImageItem[] = []) => {
  const seen = new Set<string>();
  return images
    .filter((im) => {
      // Skip site chrome, duplicates, and links to the original author's local files (file:///C:/...).
      if (!im.url || !/^https?:/.test(im.url) || SITE_CHROME_IMAGES.some((s) => im.url.includes(s)) || seen.has(im.url)) return false;
      seen.add(im.url);
      return true;
    })
    .map((im) => ({ ...im, url: mediaUrl(im.url) }));
};

export const hasOfficialContent = (page?: OfficialPage) =>
  !!page && ((page.paragraphs?.length ?? 0) > 0 || (page.lists?.length ?? 0) > 0 || (page.tables?.length ?? 0) > 0 || contentImages(page.images).length > 0);
