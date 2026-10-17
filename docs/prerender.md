# Static prerendering

`npm run build` builds the browser app, builds an Angular server bundle for build-time
rendering, renders the public page shells, writes the sitemap index, and verifies the SEO output.
Deploy only `dist/lazyrhythm`; no Node server or database credentials are required in
production. `dist/` is a build output and is not committed.
The temporary server bundle stays in `.angular/prerender-server`.

Each language has its own URLs: 繁體中文 at the root and English under `/en`. The generated
pages are `/`, `/about`, `/works`, `/art`, `/contact`, `/sponsor`, `/articles` and the same
seven under `/en` (`/en`, `/en/about`, …). Each contains its page heading, introduction,
navigation, `<html lang>`, and page-specific metadata in its own language, including a
per-language canonical and `hreflang` links to both versions (`x-default` is 中文). The build
never writes a theme: the stylesheet follows the system colour scheme, and a small inline
script in `index.html` applies a stored theme before first paint. Canvas, audio, cursor,
and animation features start only in the browser.

The URL is the only source of the language, so the server and the browser always render
the same text. The navbar toggle opens the same page under the other prefix and remembers
the choice. When that saved choice (or, without one, the browser language) differs from the
page, a dismissible card offers the other language; nothing redirects automatically, so
crawlers and shared links always get the language in the URL.

The browser hydrates the static HTML (`provideClientHydration`) instead of discarding and
re-rendering it. Components must therefore render the same DOM structure on the server
and in the browser; browser-only DOM changes belong after view initialisation, and the
server must not mutate elements the browser will reuse.

This is progressive prerendering: project lists and article lists still load their live
public data in the browser. The initial HTML contains the page introduction and loading
state, not an empty-data claim or a stale database snapshot. The build reads no database.

`sitemap.xml` is a sitemap index. `scripts/sitemap.mjs` writes it and `sitemap-pages.xml`
(the public pages in both languages, each naming its alternates) at build time. `/sitemap-articles.xml` is rewritten by
`vercel.json` to the `sitemap-articles` Supabase Edge Function
(`supabase/functions/sitemap-articles`), which lists published articles on each request,
so crawlers find a newly published article without a rebuild or the list's JavaScript.
Supabase serves function responses as `text/plain`, so `vercel.json` sets the XML content
type for that path and opts it into Vercel's external-rewrite caching (required for projects
created before April 2026), so the function's 10-minute `Cache-Control` is honoured. `supabase/config.toml` keeps the function's `verify_jwt` off for every
deployment: crawlers send no key, and it only reads public rows. It lists each article
language version at its own URL (`/articles/<slug>` or `/en/articles/<slug>`) and, when both
exist, names the other as an alternate. The function is deployed separately from the site, so
deploy it together with any change to the URL scheme. Article detail pages and
author tools remain client rendered. Full article-content prerendering would require a
separate published-article build data pipeline and rebuild policy.

`csr.html` is the neutral browser shell for dynamic routes. It intentionally has no home
canonical, Open Graph URL, or home structured data. Keep the deployment rewrites in
`vercel.json`: serve the prerendered paths of both languages explicitly and use `csr.html` for
article detail and author routes, so those pages never start with the home canonical and
structured data. The last two rewrites send every other unmatched URL to the home page of its
language (HTTP 200, home canonical), and the Angular router redirects it to that home page;
existing files are served first, so assets are unaffected. This is
intentional: the canonical consolidates them into the home page, and Search Console may
list them as soft 404s.

`npm start` and `npm run watch` retain the normal browser development workflow.
`npm run verify:seo` checks an existing production build without rebuilding it.
