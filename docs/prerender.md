# Static prerendering

`npm run build` builds the browser app, builds an Angular server bundle for build-time
rendering, renders the public page shells, writes the sitemap, and verifies the SEO output.
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
state, not an empty-data claim or a stale database snapshot. `scripts/sitemap.mjs` reads
published article slugs with the public anon key (the same read the browser makes) so
crawlers can find article URLs without the list's JavaScript; if that request fails the
build warns and the sitemap lists only the public pages. Rebuild to pick up newly
published articles. Article detail pages and
author tools remain client rendered. Full article-content prerendering would require a
separate published-article build data pipeline and rebuild policy.

`csr.html` is the neutral browser shell for dynamic routes. It intentionally has no home
canonical, Open Graph URL, or home structured data. Keep the deployment rewrites in
`vercel.json`: serve the seven prerendered paths explicitly and use `csr.html` for article
detail and author routes. Other unknown URLs return HTTP 404. Serving the home `index.html` for every URL
would send the wrong canonical and structured data before client navigation runs.

`npm start` and `npm run watch` retain the normal browser development workflow.
`npm run verify:seo` checks an existing production build without rebuilding it.
