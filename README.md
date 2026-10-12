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

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

## i18n

The site ships English and Traditional Chinese (`src/app/i18n`). The default language follows the visitor's browser languages (`zh-*` → 繁體中文, otherwise English); a manual choice from the navbar toggle is remembered in `localStorage`.

## Generative art (p5.js)

Offbeat-styled p5.js sketches live in `src/app/art/sketches` and share helpers from `src/app/art/offbeat-sketch.ts` (live Nord palette from CSS tokens, offset-shadow blocks, a swung beat clock, Euclidean rhythms).

- Gallery: `/art` — Syncopation, Offset Drift, Lazy Waveform and Offbeat Tiles, each with reroll and PNG export
- Home hero backdrop: the `field` sketch
- Host widget: `<app-p5-canvas sketch="drift" [seed]="42">` lazy-loads p5 (its own chunk, not in the initial bundle), runs outside the Angular zone, pauses off screen, follows the theme toggle, and draws a single still frame under `prefers-reduced-motion`

To add a sketch, write a `SketchFactory` and register it in `src/app/art/sketches/index.ts`.

## Articles (lab log)

- Public list: `/articles`, article page: `/articles/:slug`
- Author desk: `/articles/manage` (sign in with a Supabase Auth email/password account)
- Schema & RLS: `supabase/migrations/20261004000000_create_website_articles.sql`

Only accounts listed in `website.authors` can write. To register an author:

```sql
insert into website.authors (user_id, display_name)
select id, 'your display name' from auth.users where email = 'author@example.com';
```
