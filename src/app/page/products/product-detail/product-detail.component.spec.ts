import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { findProduct } from '../../../products/products';
import { Article, ArticleService } from '../../../services/article.service';
import { PUBLIC_CONTENT, PublicContent } from '../../../services/public-content';
import { SeoService } from '../../../services/seo.service';
import { ProductDetailComponent } from './product-detail.component';

function article(slug: string, tags: string[]): Article {
  return { id: slug, slug, lang: 'zh-TW', status: 'published', title: `${slug} title`, summary: '', content: '', tags,
    cover_image_url: null, published_at: null, updated_at: '', author_name: null };
}

describe('ProductDetailComponent prerendering', () => {
  let seo: jasmine.SpyObj<SeoService>;
  let listPublished: jasmine.Spy;

  function render(slug: string, content: PublicContent): HTMLElement {
    seo = jasmine.createSpyObj<SeoService>('SeoService', ['setProduct', 'clearProduct']);
    listPublished = jasmine.createSpy('listPublished');
    TestBed.configureTestingModule({
      imports: [ProductDetailComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ slug })) } },
        { provide: ArticleService, useValue: { listPublished } },
        { provide: SeoService, useValue: seo },
        { provide: PUBLIC_CONTENT, useValue: content }
      ]
    });
    const fixture = TestBed.createComponent(ProductDetailComponent);
    fixture.detectChanges();
    return fixture.nativeElement;
  }

  it('renders the whole product page without a request and leaves out images not exported yet', () => {
    const product = findProduct('seamless-track')!;
    const page = product.versions[0];
    const element = render('seamless-track', {
      projects: [], productAssets: [],
      articles: [article('related', ['Seamless Track']), article('other', ['Driftread'])]
    });
    expect(element.querySelector('h1')?.textContent).toContain(page.name);
    expect(element.querySelectorAll('section.block[id]').length).toBe(page.sections.length + 2); // + FAQ and links
    expect(element.querySelectorAll('.faq').length).toBe(page.faq.length);
    expect(element.querySelector('img')).toBeNull();
    expect(element.querySelector(`a[href="${product.installUrl}"]`)).not.toBeNull();
    expect(Array.from(element.querySelectorAll('.related a')).map(link => link.textContent)).toEqual(['related title']);
    expect(listPublished).not.toHaveBeenCalled();
    const [slug, seoPage] = seo.setProduct.calls.mostRecent().args;
    expect(slug).toBe('seamless-track');
    expect(seoPage?.content.lang).toBe('zh-TW');
    expect(seoPage?.image).toBeNull();
  });

  it('loads the remote images directly and announces the remote social card', () => {
    const page = findProduct('seamless-track')!.versions[0];
    const element = render('seamless-track', { projects: [], articles: [], productAssets: [page.hero!.file, page.og!.file] });
    const images = Array.from(element.querySelectorAll('img'));
    expect(images.map(image => image.getAttribute('src'))).toEqual([page.hero!.file]);
    expect(images[0].getAttribute('alt')).toBe(page.hero!.alt);
    expect(seo.setProduct.calls.mostRecent().args[1]?.image?.file).toBe(page.og!.file);
  });

  it('keeps an unknown slug out of the index', () => {
    const element = render('not-a-product', { projects: [], articles: [] });
    expect(element.querySelector('h1')).not.toBeNull();
    expect(seo.setProduct.calls.mostRecent().args).toEqual(['not-a-product', null]);
  });
});
