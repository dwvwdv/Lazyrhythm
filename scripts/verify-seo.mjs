import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const output = process.argv[2] ?? 'dist/lazyrhythm';
const origin = 'https://lazyrhythm.com';
const paths = ['/', '/about', '/works', '/art', '/articles', '/contact', '/sponsor'];
// 中文 at the root, English under /en.
const languages = { 'zh-TW': { at: path => path, locale: 'zh_TW', home: '橫跨閱讀、資安、金融、自動化與互動軟體的獨立實驗' },
  en: { at: path => (path === '/' ? '/en' : `/en${path}`), locale: 'en_US', home: 'Independent experiments across reading, security, finance, automation, and interactive software' } };
const urls = Object.values(languages).flatMap(({ at }) => paths.map(at));
const titles = new Set();
const descriptions = new Set();
const attribute = (tag, name) => tag.match(new RegExp(`\\b${name}=(["'])([\\s\\S]*?)\\1`, 'i'))?.[2];

for (const [lang, { at, locale, home }] of Object.entries(languages)) for (const page of paths) {
  const path = at(page);
  const html = await readFile(join(output, path === '/' ? 'index.html' : `${path.slice(1)}/index.html`), 'utf8');
  assert.equal(attribute(html.match(/<html\b[^>]*>/i)[0], 'lang'), lang, `${path}: html lang`);
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
  assert.equal(value('og:locale'), locale, `${path}: OG locale`);
  const hreflang = Object.fromEntries(tags.filter(tag => attribute(tag, 'rel') === 'alternate' && attribute(tag, 'hreflang'))
    .map(tag => [attribute(tag, 'hreflang'), attribute(tag, 'href')]));
  assert.deepEqual(hreflang, { 'zh-TW': `${origin}${page}`, en: `${origin}${languages.en.at(page)}`, 'x-default': `${origin}${page}` },
    `${path}: hreflang names both language versions, 中文 as x-default`);
  assert.doesNotMatch(html.match(/<html\b[^>]*>/i)[0], /data-theme=/, `${path}: theme follows the visitor, not the build`);
  assert.match(html, /<app-root\b[^>]*\sngh=/, `${path}: hydration data for reusing the static DOM`);
  const structured = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([^]*?)<\/script>/gi)];
  assert.equal(structured.length, 1, `${path}: one structured data block`);
  assert.ok(JSON.parse(structured[0][1])['@graph'].some(node => node['@type'] === 'WebSite'));
  if (page === '/') {
    assert.ok(html.includes(home), `${path}: brand introduction in ${lang}`);
    assert.match(html, /class="hero-description"/);
  }
}

assert.equal(titles.size, urls.length, 'Each public page has a distinct title in each language');
assert.equal(descriptions.size, urls.length, 'Each public page has a distinct description in each language');
const sitemap = await readFile(join(output, 'sitemap.xml'), 'utf8');
assert.match(sitemap, /<sitemapindex xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]),
  [`${origin}/sitemap-pages.xml`, `${origin}/sitemap-articles.xml`], 'Sitemap index lists the pages and live article sitemaps');
const pagesSitemap = await readFile(join(output, 'sitemap-pages.xml'), 'utf8');
assert.match(pagesSitemap, /<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9" xmlns:xhtml="http:\/\/www.w3.org\/1999\/xhtml">/);
assert.deepEqual([...pagesSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]).sort(),
  urls.map(path => `${origin}${path}`).sort(), 'Pages sitemap lists exactly the public pages in both languages');
for (const entry of pagesSitemap.match(/<url>[^]*?<\/url>/g)) {
  assert.equal(entry.match(/hreflang="(zh-TW|en|x-default)"/g)?.length, 3, `Sitemap entry names every language version: ${entry.slice(0, 80)}`);
}
const vercel = JSON.parse(await readFile('vercel.json', 'utf8'));
assert.ok(vercel.rewrites.some(rule => rule.source === '/sitemap-articles.xml' && /\/functions\/v1\/sitemap-articles$/.test(rule.destination)),
  'Article sitemap is served from the Edge Function');
assert.deepEqual(vercel.rewrites.slice(-2), [{ source: '/en/(.*)', destination: '/en/index.html' }, { source: '/(.*)', destination: '/index.html' }],
  'Unknown paths fall back to the home page of their language only after every specific rewrite');
const robots = await readFile(join(output, 'robots.txt'), 'utf8');
assert.match(robots, /User-agent:\s*\*/);
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
assert.doesNotMatch(robots, /Disallow:\s*\/\s*$/m);
const shell = await readFile(join(output, 'csr.html'), 'utf8');
assert.doesNotMatch(shell, /rel="canonical"|property="og:url"|application\/ld\+json|noindex/i, 'Dynamic shell must not inherit home canonical or an initial noindex');
console.log(`SEO artifacts verified: ${urls.length} public pages in 2 languages, sitemap index, robots and dynamic shell.`);
