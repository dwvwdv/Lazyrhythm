import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { SITE_URL } = require('../.angular/prerender-server/main.js');
const output = resolve('dist/lazyrhythm');
const pages = ['/', '/about', '/works', '/art', '/articles', '/contact', '/sponsor'];

// The public pages only change with a deploy, so they are written at build time.
// Article URLs come from the sitemap-articles Edge Function, which vercel.json serves at
// /sitemap-articles.xml, so a newly published article is listed without a rebuild.
const urlset = entries =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
await writeFile(join(output, 'sitemap-pages.xml'), urlset(pages.map(path => `  <url><loc>${SITE_URL}${path}</loc></url>`)));

const sitemaps = ['sitemap-pages.xml', 'sitemap-articles.xml'];
await writeFile(join(output, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
    sitemaps.map(file => `  <sitemap><loc>${SITE_URL}/${file}</loc></sitemap>`).join('\n')
  }\n</sitemapindex>\n`);
console.log(`Sitemap index: ${pages.length} pages, articles served live`);
