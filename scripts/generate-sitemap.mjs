// Writes public/sitemap.xml and public/robots.txt from the portal's routes and data (UX4G 6.16 / SEO).
// Set SITE_URL to the production origin, e.g. SITE_URL=https://www.mgims.ac.in npm run build
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const data = (name) => JSON.parse(fs.readFileSync(path.join(root, 'src/data', name), 'utf8'));
const site = (process.env.SITE_URL || 'https://www.mgims.ac.in').replace(/\/$/, '');

// Policy pages, in footer order (slugs as in src/pages/PolicyPage.tsx).
const policies = [
  ['privacy-policy', 'Privacy Policy'], ['terms-and-conditions', 'Terms & Conditions'], ['disclaimer', 'Disclaimer'],
  ['hyperlinking-policy', 'Hyperlinking Policy'], ['copyright-policy', 'Copyright Policy'], ['faqs', 'FAQs'],
  ['content-moderation-approval-policy', 'Content Contribution, Moderation & Approval Policy'],
  ['content-archival-policy', 'Content Archival Policy'], ['content-review-policy', 'Content Review Policy'],
  ['website-monitoring-policy', 'Website Monitoring Policy'], ['contingency-management-plan', 'Contingency Management Plan'],
  ['security-policy', 'Website Security Policy'],
];

// Routes that are not section pages, grouped as on the HTML sitemap page.
const staticGroups = [
  ['For you', [
    ['/patients', 'For patients and visitors'], ['/students', 'For students and applicants'], ['/faculty-staff', 'For faculty and staff'],
    ['/visitors', 'For the public, alumni and researchers'], ['/regulators', 'For regulators: statutory disclosures'],
  ]],
  ['Online services', [
    ['/patient-portal', 'Patient Portal'], ['/student-portal', 'Student Portal'], ['/fee-portal', 'Fee Portal'],
    ['/contact/track', 'Track an inquiry'], ['/alumni', 'Alumni network'],
  ]],
  ['News, tenders and jobs', [['/news', 'News, notices and CMEs'], ['/tenders', 'Tenders'], ['/recruitment', 'Recruitment']]],
  ['People', [['/faculty', 'Faculty directory'], ['/academics/staff-lists', 'Teaching and non-teaching staff']]],
  ['Help and policies', [
    ['/contact', 'Contact and telephone directory'], ['/feedback', 'Feedback and surveys'], ['/help', 'Help'],
    ['/accessibility-statement', 'Accessibility statement'], ['/screen-reader-access', 'Screen reader access'], ['/search', 'Search'],
    ['/sitemap', 'Sitemap'], ...policies.map(([slug, title]) => [`/policies/${slug}`, title]),
  ]],
];
const staticRoutes = ['/', '/departments', ...staticGroups.flatMap(([, links]) => links.map(([route]) => route))];

// Section ids per area, read from the page configs so the sitemap follows the menus.
// Review-only sections (unconfirmed content, hidden on the live site) are left out.
const sections = (file) => {
  const src = fs.readFileSync(path.join(root, 'src/pages', file), 'utf8');
  const block = src.slice(src.indexOf('const sections'), src.indexOf('];', src.indexOf('const sections')));
  // Each section starts at its "id: '…'"; its config runs to the next id (configs may span several lines).
  const ids = [...block.matchAll(/\bid: '([\w-]+)'/g)];
  return ids
    .map((m, i) => ({ id: m[1], config: block.slice(m.index, ids[i + 1]?.index ?? block.length) }))
    .filter(({ config }) => !config.includes('reviewOnly: true'))
    .map(({ id, config }) => ({ id, title: (config.match(/\btitle: (['"])(.*?)\1/) ?? [])[2] ?? id }));
};
const areas = {
  '/about-us': ['About MGIMS', 'AboutPage.tsx'],
  '/hospital': ['Kasturba Hospital', 'HospitalPage.tsx'],
  '/academics': ['Academics', 'AcademicsPage.tsx'],
  '/research': ['Research', 'ResearchPage.tsx'],
  '/accreditations': ['Accreditations and disclosures', 'AccreditationsPage.tsx'],
  '/community': ['Community', 'CommunityPage.tsx'],
};
const areaGroups = Object.entries(areas).map(([base, [title, file]]) => [title, sections(file).map((s) => [`${base}/${s.id}`, s.title])]);
const departmentGroup = ['Departments', [['/departments', 'All departments'], ...data('departments.json').map((d) => [`/departments/${d.id}`, d.name])]];

// The HTML sitemap page (src/pages/SitemapPage.tsx) reads this file.
fs.writeFileSync(
  path.join(root, 'src/data/site_map.json'),
  JSON.stringify({ groups: [...areaGroups, departmentGroup, ...staticGroups].map(([title, links]) => ({ title, links: links.map(([p, t]) => ({ path: p, title: t })) })) }, null, 1),
);

const urls = [
  ...staticRoutes,
  ...areaGroups.flatMap(([, links]) => links.map(([route]) => route)),
  ...data('departments.json').map((d) => `/departments/${d.id}`),
  ...data('notices_index.json').map((n) => `/notices/${n.id}`),
  ...data('alumni_distinguished.json').map((a) => `/alumni/${a.slug}`),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...new Set(urls)].map((u) => `  <url><loc>${site}${u}</loc></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(root, 'public/sitemap.xml'), xml);
fs.writeFileSync(
  path.join(root, 'public/robots.txt'),
  // The admin console is a separate app with its own robots.txt (admin/public), so nothing to exclude here.
  `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`,
);
console.log(`sitemap.xml: ${new Set(urls).size} URLs for ${site}`);
