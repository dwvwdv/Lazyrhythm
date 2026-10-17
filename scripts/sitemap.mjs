import { writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { SITE_URL, SUPABASE_URL, SUPABASE_ANON_KEY } = require('../.angular/prerender-server/main.js');
const output = resolve('dist/lazyrhythm');
const pages = ['/', '/about', '/works', '/art', '/articles', '/contact', '/sponsor'];

// Article pages are client rendered, so the sitemap is how crawlers find them without
// relying on the article list's JavaScript. Language versions share one URL per slug.
async function publishedArticles() {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/articles?select=slug,published_at,updated_at&status=eq.published`,
    {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Accept-Profile': 'website' },
      signal: AbortSignal.timeout(15000)
    }
  );
  if (!response.ok) throw new Error(`Article request failed (${response.status})`);
  const lastmod = new Map();
  for (const { slug, published_at, updated_at } of await response.json()) {
    const time = Date.parse(updated_at ?? published_at);
    if (!slug || !Number.isFinite(time)) continue;
    lastmod.set(slug, Math.max(lastmod.get(slug) ?? 0, time));
  }
  return [...lastmod].sort(([a], [b]) => a.localeCompare(b));
}

let articles = [];
try {
  articles = await publishedArticles();
} catch (error) {
  // A database outage should not block a deploy; the public pages are still listed.
  console.warn(`::warning::Sitemap lists public pages only; published articles unavailable: ${error.message}`);
}

const escape = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const entries = [
  ...pages.map(path => `  <url><loc>${SITE_URL}${path}</loc></url>`),
  ...articles.map(([slug, time]) =>
    `  <url><loc>${escape(`${SITE_URL}/articles/${encodeURIComponent(slug)}`)}</loc><lastmod>${new Date(time).toISOString()}</lastmod></url>`)
];
await writeFile(join(output, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`);
console.log(`Sitemap: ${pages.length} pages, ${articles.length} articles`);
