# Lazyrhythm

## Main skill
- Angular v17
- Typescript
- SCSS

## What is Lazyrhythm?

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.2.0 -> 17.0.2.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm run build` to build and prerender the public pages, then verify their SEO metadata. Deploy `dist/lazyrhythm`; no Node server is needed. Vercel uses the build command, output directory, and route mappings in `vercel.json`.

See [static prerendering](docs/prerender.md) for rendering boundaries and [SEO verification](docs/seo.md) for deployment and Search Console checks. `ng build` alone only builds the browser app and skips prerendering.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## i18n

The site ships Traditional Chinese and English (`src/app/i18n`), each at its own URLs: 繁體中文 at the root and English under `/en`. The URL decides the language; the navbar toggle opens the same page in the other language and remembers the choice, and a dismissible card offers the other language when the saved choice or browser language differs. See [static prerendering](docs/prerender.md) for the SEO details.

## Generative art (p5.js)

Offbeat-styled p5.js sketches live in `src/app/art/sketches` and share helpers from `src/app/art/offbeat-sketch.ts` (live Nord palette from CSS tokens, offset-shadow blocks, a swung beat clock, Euclidean rhythms).

- Gallery: `/art` — Syncopation, Offset Drift, Lazy Waveform and Offbeat Tiles, each with reroll and PNG export
- Home hero backdrop: the `field` sketch
- Host widget: `<app-p5-canvas sketch="drift" [seed]="42">` lazy-loads p5 (its own chunk, not in the initial bundle), runs outside the Angular zone, pauses off screen, follows the theme toggle, and draws a single still frame under `prefers-reduced-motion`

To add a sketch, write a `SketchFactory` and register it in `src/app/art/sketches/index.ts`.

### Sound

The gallery sketches are also instruments, synthesised live with Web Audio (no audio files):

| Sketch | Sound | Trigger |
|---|---|---|
| Syncopation | seeded drum kit, one voice per track (kick, hat, snare, rim, tom, FM blip) | every step, scheduled ahead on the audio clock; offbeats accented |
| Offset Drift | stereo wind + a faint tuned whistle | continuous; flutters on the offbeat, gusts with pointer speed, whoosh on reseed |
| Lazy Waveform | pluck / marimba / bell + soft bass | the bars that jump highest on each step |
| Offbeat Tiles | wood / glass / metal clack | every flip; diagonal waves ripple into arpeggios |

- Each sketch plays on its own bus (`SketchAudio` in `offbeat-sketch.ts`), so all four run at once and can be muted per card.
- Pitched sounds share D minor pentatonic, so any combination stays in key; each sketch's seed also rerolls its timbre, register and stereo spread.
- Sound starts off (browsers need a gesture), is audible only while a sketch is on screen, and switches off when you leave `/art`.
- Instruments live in `src/app/art/audio/instruments.ts`; the shared `AudioContext` and master compressor in `offbeat-audio.service.ts`.

## Articles (lab log)

- Public list: `/articles`, article page: `/articles/:slug`
- Author desk: `/articles/manage` (sign in with a Supabase Auth email/password account)
- Schema & RLS: `supabase/migrations/20261004000000_create_website_articles.sql`

Only accounts listed in `website.authors` can write. To register an author:

```sql
insert into website.authors (user_id, display_name)
select id, 'your display name' from auth.users where email = 'author@example.com';
```
