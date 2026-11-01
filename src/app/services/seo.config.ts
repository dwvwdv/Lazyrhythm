import { TranslationKey } from '../i18n/translations';

/** Keep this origin in sync with the deployed site's canonical host. */
export const SITE_URL = 'https://lazyrhythm.com';
export const SITE_NAME = 'LazyRhythm';
/** The name the 中文 pages use for the lab. */
export const SITE_ALTERNATE_NAME = '悠閒節奏';
/** 悠閒節奏 Facebook page (the canonical URL the share link redirects to). */
export const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61577652545497';
/** The developer's personal GitHub; it is not a brand account, so it stays out of SITE_SAME_AS. */
export const GITHUB_URL = 'https://github.com/dwvwdv';
/** Profiles that belong to LazyRhythm itself; add only accounts the brand owns. */
export const SITE_SAME_AS = ['https://ko-fi.com/lazyrhythm', FACEBOOK_URL];
export const SITE_IMAGE = `${SITE_URL}/assets/logo.png`;
/** The square logo is shown as a small card; only landscape article covers use the large card. */
export const SITE_IMAGE_SIZE = 1024;

export type SeoPage = 'home' | 'articles' | 'article' | 'product' | 'manage' | 'art' | 'about' | 'works' | 'contact' | 'sponsor' | 'notFound';

export interface PageSeo {
  title: { en: string; 'zh-TW': string };
  description: TranslationKey;
  noindex?: boolean;
}

export const PAGE_SEO: Record<SeoPage, PageSeo> = {
  home: { title: { en: 'Personal Experimental Laboratory', 'zh-TW': '個人實驗室' }, description: 'home.description' },
  articles: { title: { en: 'Articles & Dev Logs', 'zh-TW': '文章與開發日誌' }, description: 'articles.subtitle' },
  article: { title: { en: 'Article', 'zh-TW': '文章' }, description: 'articles.subtitle', noindex: true },
  // Until the product is known (or when the slug has no page) the URL is not indexable.
  product: { title: { en: 'Product', 'zh-TW': '產品' }, description: 'works.subtitle', noindex: true },
  manage: { title: { en: 'Article Management', 'zh-TW': '文章管理' }, description: 'articles.subtitle', noindex: true },
  art: { title: { en: 'Generative Art', 'zh-TW': '生成藝術' }, description: 'seo.art' },
  about: { title: { en: 'About', 'zh-TW': '關於' }, description: 'seo.about' },
  works: { title: { en: 'Projects', 'zh-TW': '作品' }, description: 'works.subtitle' },
  contact: { title: { en: 'Contact', 'zh-TW': '聯絡' }, description: 'contact.intro' },
  sponsor: { title: { en: 'Support the Lab', 'zh-TW': '支持實驗室' }, description: 'sponsor.intro' },
  notFound: { title: { en: 'Page Not Found', 'zh-TW': '找不到頁面' }, description: 'notFound.text', noindex: true }
};
