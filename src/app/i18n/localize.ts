import { Lang, SUPPORTED_LANGS } from './translations';

/** 目前語系優先，其餘語系依 SUPPORTED_LANGS 順序當作退路。 */
export function langPreference(lang: Lang): Lang[] {
  return [lang, ...SUPPORTED_LANGS.filter(item => item !== lang)];
}

/** 從同一份內容的多個語系版本中挑出最符合目前語系的一份。 */
export function pickVersion<T extends { lang: string }>(versions: T[], lang: Lang): T | null {
  for (const preferred of langPreference(lang)) {
    const match = versions.find(version => version.lang === preferred);
    if (match) {
      return match;
    }
  }
  return versions[0] ?? null;
}

/** 依 key 分組後每組挑一個語系版本，保留各組第一次出現的順序。 */
export function pickVersionsBy<T extends { lang: string }>(items: T[], key: (item: T) => string, lang: Lang): T[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const id = key(item);
    groups.set(id, [...(groups.get(id) ?? []), item]);
  }
  return [...groups.values()].map(versions => pickVersion(versions, lang)!);
}
