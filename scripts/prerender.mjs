import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { prerender, SITE_URL } = require('../.angular/prerender-server/main.js');
const output = resolve('dist/lazyrhythm');
const template = (await readFile(join(output, 'index.html'), 'utf8'))
  .replace(/<app-root\b[^>]*>[\s\S]*?<\/app-root>/i, '<app-root></app-root>');

// Preserve a neutral browser shell for dynamic URLs; never serve the home page's
// canonical/structured data as an article or author page's initial response.
const shell = template
  .replace(/<title>[\s\S]*?<\/title>/i, '<title>LazyRhythm</title>')
  .replace(/<meta\b(?=[^>]*\bname=["']description["'])[^>]*>/i,
    '<meta name="description" content="Articles, independent experiments, and interactive software from LazyRhythm.">')
  .replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi, '')
  .replace(/<meta\b(?=[^>]*(?:property|name)=["'](?:og:[^"']+|twitter:[^"']+|robots)["'])[^>]*>/gi, '')
  .replace(/<script\b(?=[^>]*\btype=["']application\/ld\+json["'])[^>]*>[\s\S]*?<\/script>/gi, '');
await writeFile(join(output, 'csr.html'), shell);

const routes = ['/', '/about', '/works', '/art', '/contact', '/sponsor', '/articles'];
for (const route of routes) {
  const html = await prerender(template, `${SITE_URL}${route}`);
  if (!/<h1\b[\s\S]*?<\/h1>/.test(html)) {
    throw new Error(`Prerendered route ${route} has no initial h1`);
  }
  const target = route === '/' ? join(output, 'index.html') : join(output, route.slice(1), 'index.html');
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, html);
  console.log(`Prerendered ${route}`);
}
