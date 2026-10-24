import { PRODUCT_SLUGS, hasProductPage } from './product-index';
import { PRODUCTS, findProduct, productImages, productVersion } from './products';

describe('product pages', () => {
  it('lists every product page in the lightweight slug index used by /works and the home page', () => {
    expect([...PRODUCT_SLUGS].sort()).toEqual(PRODUCTS.map(product => product.slug).sort());
    expect(hasProductPage('seamless-track')).toBeTrue();
    expect(hasProductPage('cotime-book')).toBeTrue();
    expect(hasProductPage('driftread')).toBeFalse();
    expect(findProduct('missing')).toBeNull();
  });

  it('gives each product real, self-consistent content', () => {
    for (const product of PRODUCTS) {
      expect(product.slug).toMatch(/^[a-z0-9-]+$/);
      expect(product.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(product.versions.length).toBeGreaterThan(0);
      expect(new Set(product.versions.map(version => version.lang)).size).toBe(product.versions.length);
      for (const version of product.versions) {
        expect(version.description.length).toBeGreaterThan(50);
        expect(version.sections.length).toBeGreaterThan(3);
        expect(version.faq.length).toBeGreaterThan(2);
        expect(new Set(version.sections.map(section => section.id)).size).toBe(version.sections.length);
        expect(version.sections.map(section => section.id)).not.toContain('faq');
        for (const image of productImages(version)) {
          expect(image.file.startsWith(`assets/products/${product.slug}/`) || image.file.startsWith('https://')).toBeTrue();
          expect(image.alt.trim()).not.toBe('');
          expect(image.width).toBeGreaterThan(0);
          expect(image.height).toBeGreaterThan(0);
        }
      }
    }
  });

  it('falls back to the version that exists', () => {
    const product = findProduct('seamless-track')!;
    expect(productVersion(product, 'en').lang).toBe('zh-TW');
    expect(productVersion(product, 'zh-TW').lang).toBe('zh-TW');
  });

  // The app's own privacy statement (seamless_track AGENTS.md「隱私與網路說明」) sets the wording.
  it('describes Seamless Track network use as the app documents it', () => {
    const text = JSON.stringify(findProduct('seamless-track'));
    expect(text).toContain('帳務資料完全本地、預設不上傳');
    expect(text).toContain('雲端備份為用戶主動啟用、內容加密、上傳至用戶自己的 Google Drive');
    expect(text).toContain('通知回報');
    expect(text).toContain('幣種代號');
    expect(text).toContain('股票代號');
    expect(text).toContain('INTERNET');
    for (const claim of ['完全不連網', '不需要網路', '無網路權限', '永不離開', '絕不上傳']) {
      expect(text).not.toContain(claim);
    }
  });

  // CoTime Book is an online app: rooms, page turns and book transfers go through Supabase.
  it('describes CoTime Book data use as the app stores it', () => {
    const text = JSON.stringify(findProduct('cotime-book'));
    expect(text).toContain('匿名');
    expect(text).toContain('暱稱');
    expect(text).toContain('檔案雜湊');
    expect(text).toContain('不保存書檔');
    expect(text).toContain('需要網路');
    for (const claim of ['完全本地', '不需要網路', '離線共讀', '不收集任何資料', '端對端加密']) {
      expect(text).not.toContain(claim);
    }
  });
});
