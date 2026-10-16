import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ArticleService, ArticleSummary } from '../../../services/article.service';
import { AuthService } from '../../../services/auth.service';
import { I18nService } from '../../../i18n/i18n.service';
import { pickVersionsBy } from '../../../i18n/localize';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-article-list',
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss']
})
export class ArticleListComponent implements OnInit, OnDestroy {
  articles: ArticleSummary[] = [];
  isLoading = true;
  loadError = false;
  private all: ArticleSummary[] = [];
  private sub?: Subscription;

  constructor(
    private articleService: ArticleService,
    readonly auth: AuthService,
    readonly i18n: I18nService,
    @Inject(PLATFORM_ID) private readonly platformId: string
  ) {}

  async ngOnInit(): Promise<void> {
    // Public article content remains live; the static build needs no database access.
    if (!isPlatformBrowser(this.platformId)) return;
    // 先訂閱再 await，避免元件在載入期間被銷毀後才建立訂閱。
    this.sub = this.i18n.lang$.subscribe(() => this.localize());

    try {
      this.all = await this.articleService.listPublished();
      this.localize();
    } catch (error) {
      console.error('Unable to load articles', error);
      this.loadError = true;
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // 每篇文章只列一次：有目前語系的版本就用它，否則退回其他語系。
  private localize(): void {
    this.articles = pickVersionsBy(this.all, article => article.slug, this.i18n.lang);
  }
}
