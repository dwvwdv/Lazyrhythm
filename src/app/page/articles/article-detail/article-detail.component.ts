import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { Article, ArticleService } from '../../../services/article.service';
import { renderMarkdown } from '../../../services/markdown';
import { I18nService } from '../../../i18n/i18n.service';
import { pickVersion } from '../../../i18n/localize';
import { TranslatePipe } from '../../../i18n/translate.pipe';
import { LocalizePipe } from '../../../i18n/localize.pipe';
import { SeoService } from '../../../services/seo.service';
import { PrerenderedContent, articleState } from '../../../services/public-content';

@Component({
  selector: 'app-article-detail',
  imports: [CommonModule, RouterModule, TranslatePipe, LocalizePipe],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss']
})
export class ArticleDetailComponent implements OnInit, OnDestroy {
  article: Article | null = null;
  html = '';
  isLoading = true;
  loadError = false;
  private readonly versions$ = new BehaviorSubject<Article[]>([]);
  private subs = new Subscription();
  private requestId = 0;

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    readonly i18n: I18nService,
    private readonly seo: SeoService,
    private readonly prerendered: PrerenderedContent
  ) {}

  /** 目前語系沒有這篇文章的翻譯，正在顯示其他語系版本。 */
  get isFallback(): boolean {
    return !!this.article && this.article.lang !== this.i18n.lang;
  }

  ngOnInit(): void {
    // 切換語系時直接換成該語系的版本。
    this.subs.add(combineLatest([this.versions$, this.i18n.lang$]).subscribe(([versions, lang]) => {
      const picked = pickVersion(versions, lang);
      // The live refresh of a prerendered article returns equal rows; keep the rendered DOM.
      const unchanged = picked && this.article && picked.id === this.article.id && picked.updated_at === this.article.updated_at;
      const article = unchanged ? this.article : picked;
      if (article !== this.article) {
        this.article = article;
        this.html = article ? renderMarkdown(article.content) : '';
      }
      this.seo.setArticle(article, versions.map(version => version.lang));
    }));
    this.subs.add(this.route.paramMap.subscribe(params => this.load(params.get('slug') ?? '')));
  }

  ngOnDestroy(): void {
    this.requestId++;
    this.subs.unsubscribe();
    this.seo.clearArticle();
  }

  private async load(slug: string): Promise<void> {
    const requestId = ++this.requestId;
    this.loadError = false;
    this.seo.setArticlePending(slug);
    // A prerendered article page starts from the versions the build read, so the static HTML
    // carries the article and its metadata; the browser then confirms it is still published.
    const prerendered = this.prerendered.take(articleState(slug),
      content => content.articles.filter(article => article.slug === slug));
    this.isLoading = !prerendered;
    this.versions$.next(prerendered ?? []);
    if (this.prerendered.isPrerendering) return;

    try {
      const versions = await this.articleService.getPublishedVersions(slug);
      if (requestId !== this.requestId) return;
      this.versions$.next(versions.filter(article => article.status === 'published' && article.slug === slug));
    } catch (error) {
      if (requestId !== this.requestId) return;
      console.error('Unable to load article', error);
      this.loadError = !prerendered;
    } finally {
      if (requestId === this.requestId) this.isLoading = false;
    }
  }
}
