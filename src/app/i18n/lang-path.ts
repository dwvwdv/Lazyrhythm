import { Lang, SUPPORTED_LANGS } from './translations';

/** The language served at the site root; English lives under /en. */
export const DEFAULT_LANG: Lang = 'zh-TW';

const PREFIX: Record<Lang, string> = { 'zh-TW': '', en: '/en' };

function splitSuffix(url: string): [string, string] {
  const index = url.search(/[?#]/);
  return index === -1 ? [url, ''] : [url.slice(0, index), url.slice(index)];
}

/** The language a URL is served in: /en and /en/... are English, everything else is the default. */
export function langFromPath(url: string): Lang {
  const [path] = splitSuffix(url);
  return path === '/en' || path.startsWith('/en/') ? 'en' : DEFAULT_LANG;
}

/** Removes the language prefix: '/en/about?x=1' -> '/about?x=1', '/en' -> '/'. */
export function stripLangPrefix(url: string): string {
  const [path, suffix] = splitSuffix(url);
  const prefix = PREFIX[langFromPath(path)];
  const bare = prefix ? path.slice(prefix.length) : path;
  return (bare.startsWith('/') ? bare : `/${bare}`) + suffix;
}

/** The same page in another language: localizePath('/about', 'en') -> '/en/about'. */
export function localizePath(url: string, lang: Lang): string {
  const [path, suffix] = splitSuffix(stripLangPrefix(url));
  const prefix = PREFIX[lang];
  return (prefix && path === '/' ? prefix : prefix + path) + suffix;
}

/** Every language version of a page, in SUPPORTED_LANGS order. */
export function languageVersions(url: string): Array<{ lang: Lang; path: string }> {
  return SUPPORTED_LANGS.map(lang => ({ lang, path: localizePath(url, lang) }));
}
