/**
 * Slugs that have a product page. Kept apart from the page content so /works and the home page
 * can link to product pages without loading it; `products.spec.ts` keeps both lists in sync.
 * A slug is listed only once its page has real content (see docs/prerender.md).
 */
export const PRODUCT_SLUGS: readonly string[] = ['seamless-track'];

/** Author-provided website covers take precedence over the project's older image. */
export const PRODUCT_COVERS: Readonly<Record<string, string>> = {
  'seamless-track': 'https://filedn.eu/lyWyjTiBuD9uWONu3Or0JNX/lazyrhythm/SeamlessTrack/website/%E4%BD%9C%E5%93%81%E5%8D%A1%E5%B0%81%E9%9D%A2%201600%C3%97900%401x.png'
};

export function hasProductPage(slug: string): boolean {
  return PRODUCT_SLUGS.includes(slug);
}

/** Root-language path; callers localize it with the `localize` pipe or `localizePath`. */
export function productPath(slug: string): string {
  return `/products/${slug}`;
}
