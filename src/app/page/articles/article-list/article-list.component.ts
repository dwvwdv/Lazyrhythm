import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    readonly i18n: I18nService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.all = await this.articleService.listPublished();
      // 每篇文章只列一次：有目前語系的版本就用它，否則退回其他語系。
      this.sub = this.i18n.lang$.subscribe(lang => (this.articles = pickVersionsBy(this.all, article => article.slug, lang)));
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
}
