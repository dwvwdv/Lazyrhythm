import { Lang } from '../i18n/translations';

/** An image the author exports into `src/assets/products/<slug>/`; pages omit it until the file exists. */
export interface ProductImage {
  /** Path under the site root, e.g. `assets/products/seamless-track/hero.png`. */
  file: string;
  width: number;
  height: number;
  alt: string;
}

export interface ProductSection {
  /** Fragment id, also used by the table of contents. */
  id: string;
  heading: string;
  paragraphs?: string[];
  items?: Array<{ title?: string; text: string }>;
  ordered?: boolean;
  /** A closing remark below the list. */
  note?: string;
  image?: ProductImage;
}

/** One language version of a product page. Only versions with real content exist. */
export interface ProductContent {
  lang: Lang;
  /** Product name in this language (h1, structured data). */
  name: string;
  /** Other official name, e.g. the English name on the 中文 page. */
  alternateName?: string;
  /** Page title without the site name. */
  title: string;
  /** Meta description: what it is and what it does, in about 120–160 characters. */
  description: string;
  eyebrow: string;
  tagline: string;
  hero?: ProductImage;
  /** Social card, 1200×630. */
  og?: ProductImage;
  facts: Array<{ label: string; value: string }>;
  sections: ProductSection[];
  faq: Array<{ question: string; answer: string }>;
  links: Array<{ label: string; url: string; note?: string }>;
  /** What the page content is based on, shown next to the last update date. */
  sourceNote: string;
}

export interface Product {
  /** Same slug as the project row in Supabase, so /works and the home page can link to it. */
  slug: string;
  /** Date (YYYY-MM-DD) the page content was last checked against the product. */
  updated: string;
  /** schema.org applicationCategory. */
  applicationCategory: string;
  operatingSystem: string;
  /** Store or download page; structured data uses it as installUrl. */
  installUrl?: string;
  /** Free to install; omit when the price is not confirmed. */
  free?: boolean;
  /** Published articles carrying this tag are listed as related reading. */
  articleTag?: string;
  versions: ProductContent[];
}
