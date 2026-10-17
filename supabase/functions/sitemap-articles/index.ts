// Serves https://lazyrhythm.com/sitemap-articles.xml (via a Vercel rewrite) from the published
// articles, so a newly published article is listed without redeploying the site.
// verify_jwt is off in supabase/config.toml: crawlers send no key, and only public rows are read.

const SITE_URL = 'https://lazyrhythm.com';
const CACHE = 'public, max-age=600, s-maxage=600';
const PREFIX: Record<string, string> = { 'zh-TW': '', en: '/en' };

function publicKey(): string {
  try {
    const key = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') ?? '{}').default;
    if (key) return key;
  } catch {
    // Fall back to the legacy key below.
  }
  return Deno.env.get('SUPABASE_ANON_KEY') ?? '';
}

const xmlEscape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

Deno.serve(async (request: Request) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
  }

  const key = publicKey();
  // Legacy anon keys are JWTs and may also go in Authorization; publishable keys must not.
  const headers: Record<string, string> = { apikey: key, 'Accept-Profile': 'website' };
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;

  const response = await fetch(
    `${Deno.env.get('SUPABASE_URL')}/rest/v1/articles?select=slug,lang,published_at,updated_at&status=eq.published`,
    { headers }
  );
  if (!response.ok) {
    console.error('Article query failed', response.status, await response.text());
    // Crawlers retry 5xx later instead of treating the sitemap as empty.
    return new Response('Sitemap temporarily unavailable', { status: 503, headers: { 'Retry-After': '600' } });
  }

  // 中文 articles live at /articles/<slug> and English ones at /en/articles/<slug>. Each language
  // version is its own entry; when both exist they name each other, with 中文 as x-default.
  const versions = new Map<string, Map<string, number>>();
  for (const { slug, lang, published_at, updated_at } of await response.json()) {
    const time = Date.parse(updated_at ?? published_at);
    if (!slug || !(lang in PREFIX) || !Number.isFinite(time)) continue;
    const byLang = versions.get(slug) ?? new Map<string, number>();
    byLang.set(lang, Math.max(byLang.get(lang) ?? 0, time));
    versions.set(slug, byLang);
  }

  const url = (slug: string, lang: string) => xmlEscape(`${SITE_URL}${PREFIX[lang]}/articles/${encodeURIComponent(slug)}`);
  const entries = [...versions].sort(([a], [b]) => a.localeCompare(b)).flatMap(([slug, byLang]) => {
    const langs = Object.keys(PREFIX).filter(lang => byLang.has(lang));
    const alternates = langs.length < 2 ? '' : [
      ...langs.map(lang => `<xhtml:link rel="alternate" hreflang="${lang}" href="${url(slug, lang)}"/>`),
      `<xhtml:link rel="alternate" hreflang="x-default" href="${url(slug, langs.includes('zh-TW') ? 'zh-TW' : langs[0])}"/>`
    ].join('');
    return langs.map(lang =>
      `  <url><loc>${url(slug, lang)}</loc><lastmod>${new Date(byLang.get(lang)!).toISOString()}</lastmod>${alternates}</url>`);
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;

  return new Response(request.method === 'HEAD' ? null : xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': CACHE }
  });
});
