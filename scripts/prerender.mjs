import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { prerender, loadPublicContent, localizeProject, SITE_URL, TRANSLATIONS } = require('../.angular/prerender-server/main.js');
const output = resolve('dist/lazyrhythm');
const template = (await readFile(join(output, 'index.html'), 'utf8'))
  .replace(/<app-root\b[^>]*>[\s\S]*?<\/app-root>/i, '<app-root></app-root>');

/** Removes everything that would present a page as an indexable copy of a specific URL. */
const neutral = html => html
  .replace(/<link\b(?=[^>]*\brel=["'](?:canonical|alternate)["'])[^>]*>/gi, '')
  .replace(/<meta\b(?=[^>]*(?:property|name)=["'](?:og:url|og:locale:alternate)["'])[^>]*>/gi, '')
  .replace(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi, '');

// Preserve a neutral browser shell for dynamic URLs; never serve the home page's
// canonical/structured data as an article or author page's initial response.
const shell = neutral(template)
  .replace(/<title>[\s\S]*?<\/title>/i, '<title>LazyRhythm</title>')
  .replace(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i,
    '<meta name="description" content="Articles, independent experiments, and interactive software from LazyRhythm.">')
  .replace(/<meta\b(?=[^>]*(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+|robots)["'])[^>]*>/gi, '');
await writeFile(join(output, 'csr.html'), shell);

// The pages list the projects and articles that are public now. A failed read stops the build,
// so a deployment never replaces the live site with empty lists.
const content = await loadPublicContent();
console.log(`Public content: ${content.projects.length} projects, ${content.articles.length} published article versions`);

async function render(route, file, check = html => html) {
  const html = check(await prerender(template, `${SITE_URL}${route}`, content));
  if (!/<h1\b[\s\S]*?<\/h1>/.test(html)) {
    throw new Error(`Prerendered route ${route} has no initial h1`);
  }
  const target = join(output, file);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html);
  console.log(`Prerendered ${route}`);
}

const fileFor = route => route === '/' ? 'index.html' : `${route.slice(1)}/index.html`;
const inBothLanguages = pages => ['', '/en'].flatMap(prefix => pages.map(page => prefix && page === '/' ? prefix : prefix + page));

// 中文 pages live at the root and the English versions under /en.
const pages = ['/', '/about', '/works', '/art', '/contact', '/sponsor', '/articles'];
for (const route of inBothLanguages(pages)) {
  await render(route, fileFor(route));
}

// Every published article at both language URLs; a version missing in one language renders the
// other with its canonical, exactly as the browser does. 'manage' is the author route, never an article.
const slugs = [...new Set(content.articles.map(article => article.slug))].filter(slug => slug !== 'manage');
for (const route of inBothLanguages(slugs.map(slug => `/articles/${slug}`))) {
  await render(route, fileFor(route), html => {
    if (/<meta\b(?=[^>]*\bname="robots")(?=[^>]*noindex)[^>]*>/.test(html)) throw new Error(`Prerendered article ${route} is not indexable`);
    return html;
  });
}

// Served by the host with HTTP 404 for every unknown URL in either language. Without hydration
// data the browser renders the not-found page in the URL's language instead of reusing this DOM.
await render('/404', '404.html', html => neutral(html)
  .replace(/<!--nghm-->/, '')
  .replace(/\sngh="[^"]*"/g, '')
  .replace(/<script\b(?=[^>]*\bid=["']ng-state["'])[^>]*>[\s\S]*?<\/script>/i, ''));

// A plain-text overview for language-model tools; search engines rely on the pages themselves.
const t = (lang, key) => TRANSLATIONS[lang][key];
const zhPath = path => path;
const enPath = path => (path === '/' ? '/en' : `/en${path}`);
const projects = content.projects.map(row => ({ en: localizeProject(row, 'en'), zh: localizeProject(row, 'zh-TW') }));
const articleVersions = slugs.flatMap(slug => content.articles.filter(article => article.slug === slug));
const llms = [
  '# LazyRhythm',
  '',
  `> ${t('en', 'home.description')}`,
  '',
  `LazyRhythm (悠閒節奏) is a personal experimental lab. ${t('en', 'home.principleP2')}`,
  `中文：${t('zh-TW', 'home.description')}`,
  '',
  'The site is available in Traditional Chinese at the root and in English under /en.',
  '',
  '## Projects',
  '',
  ...projects.map(({ en, zh }) =>
    `- [${en.title}${zh.title !== en.title ? ` (${zh.title})` : ''}](${SITE_URL}${enPath('/works')}#${en.id}): ${en.description} Official link: ${en.link}`),
  '',
  '## Articles',
  '',
  ...articleVersions.map(article =>
    `- [${article.title}](${SITE_URL}${(article.lang === 'en' ? enPath : zhPath)(`/articles/${article.slug}`)}) (${article.lang})${article.summary?.trim() ? `: ${article.summary.trim().replace(/\s+/g, ' ')}` : ''}`),
  '',
  '## Pages',
  '',
  `- [Home](${SITE_URL}/) · [English](${SITE_URL}/en)`,
  `- [About](${SITE_URL}/about) · [English](${SITE_URL}/en/about)`,
  `- [Projects](${SITE_URL}/works) · [English](${SITE_URL}/en/works)`,
  `- [Articles](${SITE_URL}/articles) · [English](${SITE_URL}/en/articles)`,
  `- [Contact](${SITE_URL}/contact) · [English](${SITE_URL}/en/contact)`,
  ''
].join('\n');
await writeFile(join(output, 'llms.txt'), llms);
console.log(`llms.txt: ${projects.length} projects, ${articleVersions.length} articles`);
