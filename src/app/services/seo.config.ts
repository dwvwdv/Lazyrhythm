import { TranslationKey } from '../i18n/translations';

/** Keep this origin in sync with the deployed site's canonical host. */
export const SITE_URL = 'https://www.lazyrhythm.com';
export const SITE_NAME = 'LazyRhythm';
export const SITE_IMAGE = `${SITE_URL}/assets/logo.png`;

export type SeoPage = 'home' | 'articles' | 'article' | 'manage' | 'art' | 'about' | 'works' | 'contact' | 'sponsor';

export interface PageSeo {
  title: { en: string; 'zh-TW': string };
  description: TranslationKey;
  noindex?: boolean;
}

export const PAGE_SEO: Record<SeoPage, PageSeo> = {
  home: { title: { en: 'Personal Experimental Laboratory', 'zh-TW': '個人實驗室' }, description: 'home.description' },
  articles: { title: { en: 'Articles & Dev Logs', 'zh-TW': '文章與開發日誌' }, description: 'articles.subtitle' },
  article: { title: { en: 'Article', 'zh-TW': '文章' }, description: 'articles.subtitle', noindex: true },
  manage: { title: { en: 'Article Management', 'zh-TW': '文章管理' }, description: 'articles.subtitle', noindex: true },
  art: { title: { en: 'Generative Art', 'zh-TW': '生成藝術' }, description: 'art.description' },
  about: { title: { en: 'About', 'zh-TW': '關於' }, description: 'about.storyP1' },
  works: { title: { en: 'Projects', 'zh-TW': '作品' }, description: 'works.subtitle' },
  contact: { title: { en: 'Contact', 'zh-TW': '聯絡' }, description: 'contact.intro' },
  sponsor: { title: { en: 'Support the Lab', 'zh-TW': '支持實驗室' }, description: 'sponsor.intro' }
};
