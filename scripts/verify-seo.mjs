import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const output = process.argv[2] ?? 'dist/lazyrhythm';
// The product pages the build rendered, from the same build-time bundle (src/app/products).
const { PRODUCTS } = createRequire(import.meta.url)('../.angular/prerender-server/main.js');
assert.ok(PRODUCTS?.length, 'Product list available from the prerender bundle (run npm run build first)');
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
// Product pages are listed once per existing language version, at that version's own URL.
const productUrls = PRODUCTS.flatMap(product => product.versions.map(version => `${origin}${languages[version.lang].at(`/products/${product.slug}`)}`));
assert.deepEqual([...pagesSitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]).sort(),
  [...urls.map(path => `${origin}${path}`), ...productUrls].sort(), 'Pages sitemap lists exactly the public pages in both languages and the product pages');
for (const entry of pagesSitemap.match(/<url>[^]*?<\/url>/g)) {
  const product = PRODUCTS.find(item => entry.includes(`/products/${item.slug}<`));
  const expected = product ? (product.versions.length > 1 ? 3 : undefined) : 3;
  assert.equal(entry.match(/hreflang="(zh-TW|en|x-default)"/g)?.length, expected, `Sitemap entry names every existing language version: ${entry.slice(0, 80)}`);
  if (product) assert.ok(entry.includes(`<lastmod>${product.updated}</lastmod>`), `Sitemap entry for ${product.slug} has its update date`);
}
const vercel = JSON.parse(await readFile('vercel.json', 'utf8'));
assert.ok(vercel.rewrites.some(rule => rule.source === '/sitemap-articles.xml' && /\/functions\/v1\/sitemap-articles$/.test(rule.destination)),
  'Article sitemap is served from the Edge Function');
assert.ok(!vercel.rewrites.some(rule => /\(\.\*\)|:path\*$/.test(rule.source) && !rule.source.includes('/manage/')),
  'No catch-all rewrite: unknown URLs get the host\'s HTTP 404 instead of a page with status 200');
const notFound = await readFile(join(output, '404.html'), 'utf8');
assert.match(notFound, /<meta\b(?=[^>]*name="robots")(?=[^>]*noindex)[^>]*>/, '404 page is noindex');
assert.match(notFound, /<h1\b[^>]*>[^]*?\S[^]*?<\/h1>/i, '404 page has a heading without JavaScript');
assert.doesNotMatch(notFound, /rel="canonical"|hreflang=|application\/ld\+json|\sngh=|id="ng-state"/,
  '404 page claims no URL and is rendered fresh in the visitor\'s language');

// Real content in the initial HTML, read from each page's transfer state (the rows the build used).
const state = html => JSON.parse(html.match(/<script id="ng-state" type="application\/json">([^]*?)<\/script>/)?.[1] ?? '{}');
const text = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const projectTitles = new Set();
for (const [lang, { at }] of Object.entries(languages)) {
  const works = await readFile(join(output, `${at('/works').slice(1)}/index.html`), 'utf8');
  const rows = state(works).projects;
  // An empty list is valid: the page then shows its empty state.
  assert.ok(Array.isArray(rows), `${at('/works')}: prerendered from the projects the build read`);
  for (const row of rows) {
    const title = row.translations?.[lang]?.title || row.title;
    projectTitles.add(row.title);
    assert.ok(works.includes(`>${text(title)}</h2>`) || works.includes(`>${text(title)}</a></h2>`), `${at('/works')}: lists ${title}`);
    if (PRODUCTS.some(product => product.slug === row.slug)) {
      assert.ok(works.includes(`href="${at(`/products/${row.slug}`)}"`), `${at('/works')}: links the ${row.slug} product page with a plain link`);
    }
    assert.ok(works.includes(text(row.translations?.[lang]?.description || row.description)), `${at('/works')}: describes ${title}`);
  }
  const home = await readFile(join(output, at('/') === '/' ? 'index.html' : `${at('/').slice(1)}/index.html`), 'utf8');
  for (const row of rows.filter(row => row.featured)) {
    const page = PRODUCTS.some(product => product.slug === row.slug);
    assert.ok(home.includes(page ? `href="${at(`/products/${row.slug}`)}"` : `#${row.slug}"`), `${at('/')}: links featured project ${row.slug}`);
  }
  const list = await readFile(join(output, `${at('/articles').slice(1)}/index.html`), 'utf8');
  const articles = state(list).articles ?? [];
  for (const slug of new Set(articles.map(article => article.slug))) {
    assert.ok(list.includes(`href="${at(`/articles/${slug}`)}"`), `${at('/articles')}: links ${slug}`);
  }
}

const articleSlugs = (await readdir(join(output, 'articles'), { withFileTypes: true })).filter(entry => entry.isDirectory()).map(entry => entry.name);
for (const slug of articleSlugs) {
  const versions = {};
  for (const [lang, { at }] of Object.entries(languages)) {
    const path = at(`/articles/${slug}`);
    const html = await readFile(join(output, `${path.slice(1)}/index.html`), 'utf8');
    const tags = html.match(/<(?:meta|link)\b[^>]*>/gi) ?? [];
    const content = key => attribute(tags.find(tag => attribute(tag, 'name') === key || attribute(tag, 'property') === key) ?? '', 'content');
    const canonical = attribute(tags.find(tag => attribute(tag, 'rel') === 'canonical') ?? '', 'href');
    const article = JSON.parse(html.match(/<script\b[^>]*type="application\/ld\+json"[^>]*>([^]*?)<\/script>/i)[1])['@graph']
      .find(node => node['@type'] === 'Article');
    assert.ok(article, `${path}: Article structured data`);
    assert.doesNotMatch(content('robots'), /noindex/, `${path}: indexable`);
    assert.equal(content('og:type'), 'article', `${path}: article OG type`);
    assert.equal(canonical, `${origin}${languages[article.inLanguage].at(`/articles/${slug}`)}`, `${path}: canonical is the shown version's URL`);
    assert.equal(content('og:url'), canonical, `${path}: OG URL matches canonical`);
    assert.equal(article.mainEntityOfPage, canonical, `${path}: structured data names the canonical page`);
    assert.ok(html.match(/<title>([^<]+)<\/title>/i)[1].startsWith(text(article.headline)), `${path}: article title`);
    const body = state(html)[`article:${slug}`]?.find(version => version.lang === article.inLanguage)?.content ?? '';
    assert.match(html, body.trim() ? /<div\b[^>]*class="prose"[^>]*>\s*<[a-z]/i : /<div\b[^>]*class="prose"/i, `${path}: article body in the initial HTML`);
    if (article.inLanguage === lang) versions[lang] = tags.filter(tag => attribute(tag, 'hreflang')).length;
  }
  const own = Object.values(versions);
  assert.ok(own.length, `/articles/${slug}: at least one language version is canonical at its own URL`);
  assert.deepEqual(own, own.length === 2 ? [3, 3] : [0], `/articles/${slug}: hreflang only names versions that exist`);
}
// Product pages: the content is in the initial HTML, with its own metadata and SoftwareApplication data.
const exists = file => access(join(output, file)).then(() => true, () => false);
const tagText = html => html.replace(/<script\b[^]*?<\/script>|<style\b[^]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
for (const product of PRODUCTS) {
  const versions = Object.fromEntries(product.versions.map(version => [version.lang, version]));
  for (const [lang, { at }] of Object.entries(languages)) {
    const path = at(`/products/${product.slug}`);
    const html = await readFile(join(output, `${path.slice(1)}/index.html`), 'utf8');
    const shown = versions[lang] ?? product.versions.find(version => version.lang === 'zh-TW') ?? product.versions[0];
    const tags = html.match(/<(?:meta|link)\b[^>]*>/gi) ?? [];
    const content = key => {
      const matches = tags.filter(tag => attribute(tag, 'name') === key || attribute(tag, 'property') === key);
      assert.equal(matches.length, 1, `${path}: one ${key}`);
      return attribute(matches[0], 'content');
    };
    const canonicals = tags.filter(tag => attribute(tag, 'rel') === 'canonical');
    const canonical = `${origin}${languages[shown.lang].at(`/products/${product.slug}`)}`;
    assert.equal(attribute(html.match(/<html\b[^>]*>/i)[0], 'lang'), lang, `${path}: html lang follows the URL`);
    assert.equal(canonicals.length, 1, `${path}: one canonical`);
    assert.equal(attribute(canonicals[0], 'href'), canonical, `${path}: canonical is the shown version's URL`);
    assert.equal(content('og:url'), canonical, `${path}: OG URL matches canonical`);
    assert.doesNotMatch(content('robots'), /noindex|nosnippet|max-snippet\s*:\s*0/i, `${path}: indexable`);
    assert.equal(content('og:type'), 'website', `${path}: website OG type`);
    assert.equal(content('og:locale'), shown.lang === 'en' ? 'en_US' : 'zh_TW', `${path}: OG locale of the shown version`);
    const title = html.match(/<title>([^<]+)<\/title>/i)?.[1];
    assert.equal(title, text(`${shown.title} | LazyRhythm`), `${path}: product title`);
    assert.equal(content('og:title'), title, `${path}: matching OG title`);
    assert.equal(content('description'), shown.description, `${path}: product description`);
    assert.equal(content('og:description'), shown.description, `${path}: matching OG description`);
    // Remote cards keep their URL; local cards are announced only when exported.
    const og = shown.og && (shown.og.file.startsWith('https://') || await exists(shown.og.file));
    assert.equal(content('og:image'), og ? new URL(shown.og.file, `${origin}/`).href : `${origin}/assets/logo.png`, `${path}: OG image`);
    assert.equal(content('twitter:image'), content('og:image'), `${path}: matching Twitter image`);
    if (og) {
      assert.equal(content('og:image:width'), String(shown.og.width), `${path}: OG image width`);
      assert.equal(content('og:image:height'), String(shown.og.height), `${path}: OG image height`);
    }
    assert.equal(content('twitter:card'), og ? 'summary_large_image' : 'summary', `${path}: card size matches the image`);
    const hreflang = tags.filter(tag => attribute(tag, 'rel') === 'alternate' && attribute(tag, 'hreflang'));
    assert.equal(hreflang.length, product.versions.length > 1 ? 3 : 0, `${path}: hreflang only names versions that exist`);
    assert.match(html, /<app-root\b[^>]*\sngh=/, `${path}: hydration data for reusing the static DOM`);
    const graph = JSON.parse(html.match(/<script\b[^>]*type="application\/ld\+json"[^>]*>([^]*?)<\/script>/i)[1])['@graph'];
    const app = graph.find(node => node['@type'] === 'SoftwareApplication');
    const webPage = graph.find(node => node['@type'] === 'WebPage');
    assert.ok(app, `${path}: SoftwareApplication structured data`);
    assert.equal(app.name, shown.name, `${path}: structured data names the product`);
    assert.equal(app.url, canonical, `${path}: structured data names the canonical page`);
    assert.equal(app.publisher?.['@id'], `${origin}/#organization`, `${path}: publisher is the site Organization`);
    assert.ok(graph.some(node => node['@type'] === 'Organization' && node['@id'] === app.publisher['@id']), `${path}: publisher @id resolves in the graph`);
    assert.equal(app.operatingSystem, product.operatingSystem, `${path}: operating system`);
    assert.equal(app.applicationCategory, product.applicationCategory, `${path}: application category`);
    if (product.installUrl) assert.equal(app.installUrl, product.installUrl, `${path}: install URL`);
    assert.equal(webPage?.dateModified, product.updated, `${path}: page update date`);
    assert.equal(webPage?.about?.['@id'], app['@id'], `${path}: page is about the app`);
    // Visible content without JavaScript: heading, every section, every FAQ answer, official links.
    assert.match(html, new RegExp(`<h1\\b[^>]*>\\s*${text(shown.name)}`), `${path}: product name heading`);
    const body = tagText(html);
    for (const section of shown.sections) {
      assert.ok(html.includes(`id="${section.id}"`) && body.includes(text(section.heading)), `${path}: section ${section.heading}`);
      for (const paragraph of section.paragraphs ?? []) assert.ok(body.includes(text(paragraph)), `${path}: ${section.id} text`);
      for (const item of section.items ?? []) assert.ok(body.includes(text(item.text)), `${path}: ${section.id} item`);
    }
    for (const entry of shown.faq) assert.ok(body.includes(text(entry.question)) && body.includes(text(entry.answer)), `${path}: FAQ ${entry.question}`);
    for (const link of shown.links) assert.ok(html.includes(`href="${text(link.url)}"`), `${path}: links ${link.url}`);
    assert.ok(html.includes(`href="${at('/works')}#${product.slug}"`), `${path}: links back to the projects page`);
    // Remote page images must keep their exact configured URL in the initial HTML.
    for (const image of [shown.hero, ...shown.sections.map(section => section.image)].filter(Boolean)) {
      if (image.file.startsWith('https://')) assert.ok(html.includes(`src="${text(image.file)}"`), `${path}: remote image ${image.file}`);
    }
    // Every local image on the page exists in the build output.
    for (const [, src] of html.matchAll(/<img\b[^>]*\bsrc="(\/assets\/products\/[^"]+)"/g)) {
      assert.ok(await exists(src.slice(1)), `${path}: image ${src} is in the build`);
    }
  }
}

const llms = await readFile(join(output, 'llms.txt'), 'utf8');
for (const product of PRODUCTS) assert.ok(llms.includes(`${origin}/products/${product.slug}`) || llms.includes(`${origin}/en/products/${product.slug}`), `llms.txt links the ${product.slug} page`);
for (const title of projectTitles) assert.ok(llms.includes(title), `llms.txt names ${title}`);
const robots = await readFile(join(output, 'robots.txt'), 'utf8');
assert.match(robots, /User-agent:\s*\*/);
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
assert.doesNotMatch(robots, /Disallow:\s*\/\s*$/m);
const shell = await readFile(join(output, 'csr.html'), 'utf8');
assert.doesNotMatch(shell, /rel="canonical"|property="og:url"|application\/ld\+json|noindex/i, 'Dynamic shell must not inherit home canonical or an initial noindex');
console.log(`SEO artifacts verified: ${urls.length} public pages, ${PRODUCTS.length * 2} product URLs and ${articleSlugs.length * 2} article URLs across 2 languages, 404 page, llms.txt, sitemap index, robots and dynamic shell.`);
