// Serves https://lazyrhythm.com/sitemap-articles.xml (via a Vercel rewrite) from the published
// articles, so a newly published article is listed without redeploying the site.
// Deploy with verify_jwt = false: crawlers send no key, and only public rows are read.

const SITE_URL = 'https://lazyrhythm.com';
const CACHE = 'public, max-age=600, s-maxage=600';

function publicKey(): string {
  try {
    const key = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') ?? '{}').default;
    if (key) return key;
  } catch {
    // Fall back to the legacy key below.
  }
  return Deno.env.get('SUPABASE_ANON_KEY') ?? '';
}

const escape = (value: string) =>
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
    `${Deno.env.get('SUPABASE_URL')}/rest/v1/articles?select=slug,published_at,updated_at&status=eq.published`,
    { headers }
  );
  if (!response.ok) {
    console.error('Article query failed', response.status, await response.text());
    // Crawlers retry 5xx later instead of treating the sitemap as empty.
    return new Response('Sitemap temporarily unavailable', { status: 503, headers: { 'Retry-After': '600' } });
  }

  // Language versions share one URL per slug; lastmod is the newest version's update time.
  const lastmod = new Map<string, number>();
  for (const { slug, published_at, updated_at } of await response.json()) {
    const time = Date.parse(updated_at ?? published_at);
    if (!slug || !Number.isFinite(time)) continue;
    lastmod.set(slug, Math.max(lastmod.get(slug) ?? 0, time));
  }

  const entries = [...lastmod]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([slug, time]) =>
      `  <url><loc>${escape(`${SITE_URL}/articles/${encodeURIComponent(slug)}`)}</loc><lastmod>${new Date(time).toISOString()}</lastmod></url>`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

  return new Response(request.method === 'HEAD' ? null : xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': CACHE }
  });
});
