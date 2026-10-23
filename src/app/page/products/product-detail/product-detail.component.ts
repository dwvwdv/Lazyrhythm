import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { I18nService } from '../../../i18n/i18n.service';
import { pickVersionsBy } from '../../../i18n/localize';
import { LocalizePipe } from '../../../i18n/localize.pipe';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { Product, ProductContent, ProductImage } from '../../../products/product.model';
import { findProduct, productImages, productVersion } from '../../../products/products';
import { ArticleService, ArticleSummary } from '../../../services/article.service';
import { PrerenderedContent, productArticlesState, productAssetsState, summarize } from '../../../services/public-content';
import { SeoService } from '../../../services/seo.service';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterModule, TranslatePipe, LocalizePipe],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  content: ProductContent | null = null;
  related: ArticleSummary[] = [];
  /**
   * Remote URLs and local files selected by the build. Null on an in-app visit: every image is
   * tried and one that fails to load is hidden, so a page never shows a broken image.
   */
  private assets: Set<string> | null = null;
  private readonly failed = new Set<string>();
  private articles: ArticleSummary[] = [];
  private readonly subs = new Subscription();
  private requestId = 0;
  private slug = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly articleService: ArticleService,
    readonly i18n: I18nService,
    private readonly seo: SeoService,
    private readonly prerendered: PrerenderedContent,
    @Inject(PLATFORM_ID) private readonly platformId: string
  ) {}

  /** The page language has no version of this product, so another version is shown. */
  get isFallback(): boolean {
    return !!this.content && this.content.lang !== this.i18n.lang;
  }

  ngOnInit(): void {
    this.subs.add(this.route.paramMap.subscribe(params => this.load(params.get('slug') ?? '')));
    this.subs.add(this.i18n.lang$.subscribe(() => this.localize()));
  }

  ngOnDestroy(): void {
    this.requestId++;
    this.subs.unsubscribe();
    this.seo.clearProduct();
  }

  shows(image: ProductImage | undefined): image is ProductImage {
    return !!image && !this.failed.has(image.file) && (!this.assets || this.assets.has(image.file));
  }

  hide(image: ProductImage): void {
    this.failed.add(image.file);
  }

  src(image: ProductImage): string {
    return image.file.startsWith('https://') ? image.file : `/${image.file}`;
  }

  trackArticle(_: number, article: ArticleSummary): string {
    return article.id;
  }

  private async load(slug: string): Promise<void> {
    const requestId = ++this.requestId;
    this.slug = slug;
    this.product = findProduct(slug);
    this.failed.clear();
    const files = this.product ? this.product.versions.flatMap(productImages).map(image => image.file) : [];
    const assets = this.prerendered.take(productAssetsState(slug), content => files.filter(file => content.productAssets?.includes(file)));
    this.assets = assets ? new Set(assets) : null;
    const tag = this.product?.articleTag?.toLowerCase();
    const matches = (article: ArticleSummary) => !!tag && article.tags.some(item => item.toLowerCase() === tag);
    const prerendered = this.product
      ? this.prerendered.take(productArticlesState(slug), content => content.articles.filter(matches).map(summarize))
      : null;
    this.articles = prerendered ?? [];
    this.localize();
    if (!this.product || !isPlatformBrowser(this.platformId)) return;

    // Related articles published since the build; a failed refresh keeps the prerendered list.
    try {
      const articles = await this.articleService.listPublished();
      if (requestId !== this.requestId) return;
      this.articles = articles.filter(matches);
      this.localize();
    } catch (error) {
      console.error('Unable to load related articles', error);
    }
  }

  private localize(): void {
    const product = this.product;
    this.content = product ? productVersion(product, this.i18n.lang) : null;
    this.related = pickVersionsBy(this.articles, article => article.slug, this.i18n.lang);
    const og = this.content?.og;
    // Remote cards also work on in-app visits without prerendered asset state.
    const image = og && (this.assets?.has(og.file) || (!this.assets && og.file.startsWith('https://'))) ? og : null;
    this.seo.setProduct(this.slug, product && this.content ? { product, content: this.content, image } : null);
  }
}
