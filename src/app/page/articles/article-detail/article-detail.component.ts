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
    private readonly seo: SeoService
  ) {}

  /** 目前語系沒有這篇文章的翻譯，正在顯示其他語系版本。 */
  get isFallback(): boolean {
    return !!this.article && this.article.lang !== this.i18n.lang;
  }

  ngOnInit(): void {
    // 切換語系時直接換成該語系的版本。
    this.subs.add(combineLatest([this.versions$, this.i18n.lang$]).subscribe(([versions, lang]) => {
      const article = pickVersion(versions, lang);
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
    this.isLoading = true;
    this.loadError = false;
    this.seo.setArticlePending(slug);
    this.versions$.next([]);

    try {
      const versions = await this.articleService.getPublishedVersions(slug);
      if (requestId !== this.requestId) return;
      this.versions$.next(versions.filter(article => article.status === 'published' && article.slug === slug));
    } catch (error) {
      if (requestId !== this.requestId) return;
      console.error('Unable to load article', error);
      this.loadError = true;
    } finally {
      if (requestId === this.requestId) this.isLoading = false;
    }
  }
}
