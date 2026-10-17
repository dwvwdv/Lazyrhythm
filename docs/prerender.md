# Static prerendering

`npm run build` builds the browser app, builds an Angular server bundle for build-time
rendering, renders the public page shells, writes the sitemap index, and verifies the SEO output.
Deploy only `dist/lazyrhythm`; no Node server or database credentials are required in
production. `dist/` is a build output and is not committed.
The temporary server bundle stays in `.angular/prerender-server`.

The generated pages are `/`, `/about`, `/works`, `/art`, `/contact`, `/sponsor`, and
`/articles`. Each contains its page heading, introduction, navigation, and page-specific
metadata in the initial HTML. The build always renders English and never writes a theme:
the stylesheet follows the system colour scheme, and a small inline script in
`index.html` applies a stored theme before first paint. The language preference takes
effect when Angular starts. Canvas, audio, cursor, and animation features start only in
the browser.

The browser hydrates the static HTML (`provideClientHydration`) instead of discarding and
re-rendering it. Components must therefore render the same DOM structure on the server
and in the browser; browser-only DOM changes belong after view initialisation, and the
server must not mutate elements the browser will reuse.

This is progressive prerendering: project lists and article lists still load their live
public data in the browser. The initial HTML contains the page introduction and loading
state, not an empty-data claim or a stale database snapshot. The build reads no database.

`sitemap.xml` is a sitemap index. `scripts/sitemap.mjs` writes it and `sitemap-pages.xml`
(the seven public pages) at build time. `/sitemap-articles.xml` is rewritten by
`vercel.json` to the `sitemap-articles` Supabase Edge Function
(`supabase/functions/sitemap-articles`), which lists published articles on each request,
so crawlers find a newly published article without a rebuild or the list's JavaScript.
Supabase serves function responses as `text/plain`, so `vercel.json` sets the XML content
type for that path. `supabase/config.toml` keeps the function's `verify_jwt` off for every
deployment: crawlers send no key, and it only reads public rows. Article detail pages and
author tools remain client rendered. Full article-content prerendering would require a
separate published-article build data pipeline and rebuild policy.

`csr.html` is the neutral browser shell for dynamic routes. It intentionally has no home
canonical, Open Graph URL, or home structured data. Keep the deployment rewrites in
`vercel.json`: serve the seven prerendered paths explicitly and use `csr.html` for article
detail and author routes, so those pages never start with the home canonical and
structured data. The last rewrite sends every other unmatched URL to the home page (HTTP 200,
home canonical); existing files are served first, so assets are unaffected. This is
intentional: the canonical consolidates them into the home page, and Search Console may
list them as soft 404s.

`npm start` and `npm run watch` retain the normal browser development workflow.
`npm run verify:seo` checks an existing production build without rebuilding it.
