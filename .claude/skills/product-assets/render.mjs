// Renders every promo source page in a folder to a PNG of its exact size.
//
//   node .claude/skills/product-assets/render.mjs <src-dir> <out-dir> [name-filter]
//
// Each source page declares its output in a meta tag:
//   <meta name="asset" content="2400x1200" data-file="Hero 2400×1200@1x.png">
// The optional third argument renders only pages whose output name contains it,
// so a revision re-renders just the images the reviewer asked to change.
import { readdir, readFile, mkdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const [srcDir, outDir, filter = ''] = process.argv.slice(2);
if (!srcDir || !outDir) {
  console.error('usage: render.mjs <src-dir> <out-dir> [name-filter]');
  process.exit(1);
}
await mkdir(outDir, { recursive: true });

const pages = [];
for (const name of (await readdir(srcDir)).filter(name => name.endsWith('.html')).sort()) {
  const html = await readFile(join(srcDir, name), 'utf8');
  const meta = html.match(/<meta\s+name="asset"\s+content="(\d+)x(\d+)"\s+data-file="([^"]+)"/);
  if (!meta) {
    console.warn(`skip ${name}: no <meta name="asset" content="WxH" data-file="...">`);
    continue;
  }
  const [, width, height, file] = meta;
  if (file.includes(filter)) pages.push({ source: resolve(srcDir, name), width: +width, height: +height, file });
}

const browser = await chromium.launch();
try {
  for (const page of pages) {
    const tab = await browser.newPage({ viewport: { width: page.width, height: page.height }, deviceScaleFactor: 1 });
    await tab.goto(pathToFileURL(page.source).href, { waitUntil: 'networkidle' });
    // Web fonts decide line breaks; a screenshot before they load shows the fallback font.
    await tab.evaluate(() => document.fonts.ready);
    const overflow = await tab.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight]);
    const out = join(outDir, page.file);
    await tab.screenshot({ path: out, clip: { x: 0, y: 0, width: page.width, height: page.height } });
    await tab.close();
    const note = overflow[0] > page.width || overflow[1] > page.height ? `  ⚠ content overflows (${overflow.join('×')})` : '';
    console.log(`${page.file}  ${page.width}×${page.height}  ${(await stat(out)).size} bytes${note}`);
  }
} finally {
  await browser.close();
}
