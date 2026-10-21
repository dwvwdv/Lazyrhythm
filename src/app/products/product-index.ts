/**
 * Slugs that have a product page. Kept apart from the page content so /works and the home page
 * can link to product pages without loading it; `products.spec.ts` keeps both lists in sync.
 * A slug is listed only once its page has real content (see docs/prerender.md).
 */
export const PRODUCT_SLUGS: readonly string[] = ['seamless-track'];

export function hasProductPage(slug: string): boolean {
  return PRODUCT_SLUGS.includes(slug);
}

/** Root-language path; callers localize it with the `localize` pipe or `localizePath`. */
export function productPath(slug: string): string {
  return `/products/${slug}`;
}
