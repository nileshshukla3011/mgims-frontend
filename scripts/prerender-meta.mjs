// Writes dist/<route>/index.html for every known page, with that page's title, description, canonical address and
// link-preview (Open Graph) tags in the HTML itself. Search engines and link previews (WhatsApp, Facebook, LinkedIn)
// read these without running JavaScript; the app then loads as usual. Run after `vite build` (npm run build does).
// The server serves $uri/index.html first and falls back to /index.html (deploy/nginx/mgims.conf).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dist = path.join(root, 'dist');
const site = (process.env.SITE_URL || 'https://www.mgims.ac.in').replace(/\/+$/, '');
const SITE_NAME = 'MGIMS Sevagram';
const data = (name) => JSON.parse(fs.readFileSync(path.join(root, 'src/data', name), 'utf8'));

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clip = (text, length = 160) => (text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text);

/** route -> { title, description } */
const pages = new Map();
for (const group of data('site_map.json').groups) {
  for (const link of group.links) {
    if (link.path === '/' || link.path.includes('?')) continue;
    pages.set(link.path, { title: link.title, description: `${link.title}: ${group.title}, Mahatma Gandhi Institute of Medical Sciences, Sevagram.` });
  }
}
for (const dept of data('departments.json')) {
  const overview = (dept.overview || dept.paragraphs?.[0] || '').replace(/\s+/g, ' ').trim();
  pages.set(`/departments/${dept.id}`, { title: `Department of ${dept.name}`, description: overview || `Department of ${dept.name}, MGIMS Sevagram.` });
}
for (const alumnus of data('alumni_distinguished.json')) {
  pages.set(`/alumni/${alumnus.slug}`, { title: alumnus.name, description: `${alumnus.name}, ${alumnus.role}. Distinguished alumni, MGIMS Sevagram.` });
}
for (const notice of data('notices_index.json')) {
  pages.set(`/notices/${notice.id}`, { title: notice.title, description: (notice.excerpt || notice.title).replace(/\s+/g, ' ').trim() });
}

let written = 0;
for (const [route, { title, description }] of pages) {
  const url = `${site}${route}`;
  const fullTitle = escape(`${title} | ${SITE_NAME}`);
  const text = escape(clip(description));
  const html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${fullTitle}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${text}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escape(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${text}$2`)
    .replace('</head>', `    <link rel="canonical" href="${escape(url)}" />\n    <meta property="og:url" content="${escape(url)}" />\n  </head>`);
  const file = path.join(dist, route, 'index.html');
  if (!file.startsWith(dist + path.sep)) continue; // never write outside dist/
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  written++;
}
console.log(`Pre-rendered page metadata for ${written} routes into dist/.`);
