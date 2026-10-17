// Copies the photos the website shows from the old site (www.mgims.ac.in) into a folder, keeping each file's path,
// so they can be published on the new hosting and loaded from there (VITE_MEDIA_BASE_URL, src/utils/media.ts).
//   node scripts/download-media.mjs <folder> [--limit N]
// Files already in the folder are skipped, so the script can be re-run. Requests are made a few at a time.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const [outDir, ...flags] = process.argv.slice(2);
if (!outDir) {
  console.error('Usage: node scripts/download-media.mjs <folder> [--limit N]');
  process.exit(1);
}
const limitAt = flags.indexOf('--limit');
const limit = limitAt >= 0 ? Number(flags[limitAt + 1]) : Infinity;

// The same filter as contentImages() in src/utils/officialContent.ts: no site chrome, only http(s) addresses.
const CHROME = ['/images/header.png', '/images/logo_sm.png', '/images/mp/shs1.jpg', 'placeholder-image.png'];
const OLD_SITE = /^https?:\/\/(www\.)?mgims\.ac\.in\//i;
const urls = new Set();
const collect = (images = []) => images.forEach(({ url }) => url && OLD_SITE.test(url) && !CHROME.some((c) => url.includes(c)) && urls.add(url));
const data = (name) => JSON.parse(fs.readFileSync(path.join(root, 'src/data', name), 'utf8'));
for (const name of ['hospital', 'institute', 'academics', 'research', 'accreditations', 'community']) Object.values(data(`${name}.json`)).forEach((p) => collect(p.images));
data('departments.json').forEach((d) => collect(d.images));
for (const file of fs.readdirSync(path.join(root, 'src/data/notices'))) collect(data(`notices/${file}`).images);

const list = [...urls].slice(0, limit);
console.log(`${urls.size} photos found; downloading ${list.length} into ${outDir}`);
let done = 0, skipped = 0;
const failed = [];
const worker = async (queue) => {
  for (let url = queue.shift(); url; url = queue.shift()) {
    const target = path.join(outDir, decodeURIComponent(new URL(url).pathname));
    if (fs.existsSync(target)) { skipped++; continue; }
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, Buffer.from(await res.arrayBuffer()));
      done++;
    } catch (error) {
      failed.push(`${url}  (${error.message})`);
    }
  }
};
const queue = [...list];
await Promise.all(Array.from({ length: 4 }, () => worker(queue)));
console.log(`Downloaded ${done}, already there ${skipped}, failed ${failed.length}.`);
if (failed.length) console.log(failed.join('\n'));
