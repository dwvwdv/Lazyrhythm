# Static prerendering

`npm run build` builds the browser app, builds an Angular server bundle for build-time
rendering, reads the public content from Supabase, renders the public pages, writes the sitemap
index and `llms.txt`, and verifies the SEO output. Deploy only `dist/lazyrhythm`; no Node server
or database credentials are required in production. `dist/` is a build output and is not committed.
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

The build reads the projects and every published article version with the public key, so row
level security limits it to what any visitor can see (`loadPublicContent` in `src/main.server.ts`).
A failed read stops the build, so Vercel keeps the previous deployment instead of publishing pages
without projects or articles. Pages render these rows while prerendering (`PUBLIC_CONTENT`) and
store them in the page's transfer state; in the browser the same components start from that state,
so hydration reuses the server DOM, and then refresh from the live data. Lists use `trackBy`, so an
unchanged refresh keeps the DOM, and a refresh that fails keeps the prerendered content.

Prerendered with real content:

- `/works` and `/en/works`: every project (title, description, tags, stack, link); each card has the
  project slug as its `id`, so `/works#<slug>` links to it.
- `/` and `/en`: the featured projects, linked to their cards on the projects page.
- `/articles` and `/en/articles`: the published articles, one entry per slug in the page language
  when it exists.
- `/articles/<slug>` and `/en/articles/<slug>` for every published slug: the article in the URL's
  language, or the other version with its canonical when only that one exists, with its title,
  description, Open Graph, `Article` structured data and `hreflang` for existing versions only.
  They are written to `articles/<slug>/index.html`; the host serves an existing file before any
  rewrite, so an article published after the last build still opens through `csr.html`.
- `/products/<slug>` and `/en/products/<slug>` for every product in `src/app/products/products.ts`:
  what the product is, the problem it solves, how it works, features, privacy, limitations, FAQ,
  official links, related articles (published articles tagged with the product's `articleTag`) and
  the last update date, with their own title, description, canonical, Open Graph and
  `SoftwareApplication` + `WebPage` structured data (publisher is the site `Organization` `@id`).
  Product content lives in the repository, not Supabase: it changes together with the product and its
  screenshots, goes through review, and needs no database read. A product without a version in the
  URL's language shows the other version with its canonical and no `hreflang`, like an article; only
  canonical URLs go into `sitemap-pages.xml`. `/works` and the home page link to the page with plain
  links (`PRODUCT_SLUGS` in `product-index.ts`, so those pages do not load the product content). A slug
  is added only once it has real content. Images accept absolute HTTPS URLs or local paths under
  `src/assets/products/<slug>/`; the build passes remote URLs and existing local files to the page
  (`productAssets`). Missing local exports are left out (social cards fall back to the logo).
  Seamless Track, CoTime Book and Driftread directly load their Hero, OG card, three feature images and
  works cover from the author's `https://filedn.eu/lyWyjTiBuD9uWONu3Or0JNX/lazyrhythm/SeamlessTrack/website/`,
  `…/lazyrhythm/CotimeBook/website/` and `…/lazyrhythm/Driftread/website/` directories; image binaries are not stored in the repo or
  downloaded during the build. `PRODUCT_COVERS` in `product-index.ts` selects the new remote `/works`
  cover before the Supabase image without a database edit. CoTime Book has no public store listing
  yet and its source will not be public, so its page has no `installUrl` and no external links until the
  store listing is live. Driftread is a web app: no `installUrl` (it is not a download), its only
  external link is the live site, and it has no GitHub link because the repository has no licence.
  Unknown product slugs have no file and get the host's 404.
- `404.html`: the not-found page, without canonical or hydration data, so the browser renders it
  in the URL's language.

Content changes reach the static pages through a rebuild. The migration
`20261020080000_website_rebuild_on_publish.sql` calls a Vercel Deploy Hook (stored in Vault as
`vercel_deploy_hook`) after a published article is created, changed, unpublished or deleted, and
after any project change; draft edits do not rebuild. Without the secret the trigger does nothing.
Until the rebuild finishes, the browser shows the live data on top of the prerendered pages.

`llms.txt` is a plain-text overview for language-model tools (brand, projects, articles, pages),
generated from the same content. Search engines index the pages themselves; it is optional.

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
deploy it together with any change to the URL scheme. Author tools remain client rendered.

`csr.html` is the neutral browser shell for dynamic routes. It intentionally has no home
canonical, Open Graph URL, or home structured data. Keep the deployment rewrites in
`vercel.json`: serve the prerendered paths of both languages explicitly and use `csr.html` for
author routes and for article URLs without a prerendered file, so those pages never start with
the home canonical and structured data. There is no catch-all rewrite: every other URL gets the
host's HTTP 404 with `404.html`, and the Angular router shows the same not-found page for unknown
links inside the app. An unknown article slug still opens `csr.html` with HTTP 200 and is marked
`noindex` in the browser, because the static host cannot tell it from an article published after
the last build.

`npm start` and `npm run watch` retain the normal browser development workflow.
`npm run verify:seo` checks an existing production build without rebuilding it.
