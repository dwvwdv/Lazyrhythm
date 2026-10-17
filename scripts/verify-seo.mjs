import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const output = process.argv[2] ?? 'dist/lazyrhythm';
const origin = 'https://lazyrhythm.com';
const paths = ['/', '/about', '/works', '/art', '/articles', '/contact', '/sponsor'];
const titles = new Set();
const descriptions = new Set();
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}=(["'])([\\s\\S]*?)\\1`, 'i'))?.[2];

for (const path of paths) {
  const html = await readFile(join(output, path === '/' ? 'index.html' : `${path.slice(1)}/index.html`), 'utf8');
  assert.doesNotMatch(html, /https:\/\/www\.lazyrhythm\.com\b/i, `${path}: all metadata and structured data use the apex domain`);
  const tags = html.match(/<(?:meta|link)\b[^>]*>/gi) ?? [];
  const meta = (key) => tags.filter(tag => attribute(tag, 'name') === key || attribute(tag, 'property') === key);
  const value = (key) => {
    const matches = meta(key);
    assert.equal(matches.length, 1, `${path}: one ${key}`);
    const content = attribute(matches[0], 'content');
    assert.ok(content?.trim(), `${path}: nonempty ${key}`);
    return content;
  };
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
  assert.ok(title?.includes('LazyRhythm'), `${path}: branded title`);
  titles.add(title);
  descriptions.add(value('description'));
  assert.equal(value('og:title'), title, `${path}: matching OG title`);
  assert.equal(value('og:description'), value('description'), `${path}: matching OG description`);
  assert.equal(value('og:url'), `${origin}${path}`, `${path}: canonical OG URL`);
  assert.equal(value('og:type'), 'website', `${path}: website OG type`);
  assert.ok(value('og:image').startsWith(`${origin}/`), `${path}: absolute public image`);
  assert.doesNotMatch(value('robots'), /noindex|nosnippet|max-snippet\s*:\s*0/i, `${path}: indexable`);
  const canonical = tags.filter(tag => attribute(tag, 'rel') === 'canonical');
  assert.equal(canonical.length, 1, `${path}: one canonical`);
  assert.equal(attribute(canonical[0], 'href'), `${origin}${path}`);
  assert.match(html, /<h1\b[^>]*>[^]*?\S[^]*?<\/h1>/i, `${path}: initial heading`);
  assert.doesNotMatch(html, /hreflang=/i, `${path}: no nonexistent language URLs`);
  assert.doesNotMatch(html.match(/<html\b[^>]*>/i)[0], /data-theme=/, `${path}: theme follows the visitor, not the build`);
  assert.match(html, /<app-root\b[^>]*\sngh=/, `${path}: hydration data for reusing the static DOM`);
  const structured = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([^]*?)<\/script>/gi)];
  assert.equal(structured.length, 1, `${path}: one structured data block`);
  assert.ok(JSON.parse(structured[0][1])['@graph'].some(node => node['@type'] === 'WebSite'));
  if (path === '/') {
    assert.match(html, /Independent experiments across reading, security, finance, automation, and interactive software/);
    assert.match(html, /class="hero-description"/);
  }
}

assert.equal(titles.size, paths.length, 'Each public page has a distinct title');
assert.equal(descriptions.size, paths.length, 'Each public page has a distinct description');
const sitemap = await readFile(join(output, 'sitemap.xml'), 'utf8');
assert.match(sitemap, /<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.equal(new Set(locs).size, locs.length, 'Sitemap URLs are unique');
for (const path of paths) assert.ok(locs.includes(`${origin}${path}`), `Sitemap lists ${path}`);
const articleLocs = locs.filter(loc => !paths.some(path => loc === `${origin}${path}`));
for (const loc of articleLocs) {
  assert.match(loc, /^https:\/\/lazyrhythm\.com\/articles\/[^/?#]+$/, `Sitemap only adds article URLs: ${loc}`);
  assert.doesNotMatch(loc, /\/articles\/manage$/, 'Sitemap never lists author tools');
}
const robots = await readFile(join(output, 'robots.txt'), 'utf8');
assert.match(robots, /User-agent:\s*\*/);
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
assert.doesNotMatch(robots, /Disallow:\s*\/\s*$/m);
const shell = await readFile(join(output, 'csr.html'), 'utf8');
assert.doesNotMatch(shell, /rel="canonical"|property="og:url"|application\/ld\+json|noindex/i, 'Dynamic shell must not inherit home canonical or an initial noindex');
console.log(`SEO artifacts verified: ${paths.length} public pages, ${articleLocs.length} sitemap articles, robots and dynamic shell.`);
