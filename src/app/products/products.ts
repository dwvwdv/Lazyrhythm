import { Lang } from '../i18n/translations';
import { pickVersion } from '../i18n/localize';
import { Product, ProductContent, ProductImage } from './product.model';
import { COTIME_BOOK } from './cotime-book';
import { SEAMLESS_TRACK } from './seamless-track';

/**
 * Product pages, stored in the repository rather than Supabase: the content changes with the
 * product (screenshots can be hosted remotely or in `src/assets/products/`), every change goes through
 * review, and the build can prerender it without a database read. Add a product here and its slug
 * to `PRODUCT_SLUGS` only when it has real content; the other projects stay on /works until then.
 */
export const PRODUCTS: readonly Product[] = [SEAMLESS_TRACK, COTIME_BOOK];

export function findProduct(slug: string): Product | null {
  return PRODUCTS.find(product => product.slug === slug) ?? null;
}

/** The version in the page language, else the closest one (its URL is then the canonical). */
export function productVersion(product: Product, lang: Lang): ProductContent {
  return pickVersion(product.versions, lang)!;
}

/** Every image a version refers to, for the build to check which files exist. */
export function productImages(content: ProductContent): ProductImage[] {
  return [content.hero, content.og, ...content.sections.map(section => section.image)]
    .filter((image): image is ProductImage => !!image);
}
