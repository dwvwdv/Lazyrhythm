import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Article, ArticleService } from '../../../services/article.service';
import { renderMarkdown } from '../../../services/markdown';
import { I18nService } from '../../../i18n/i18n.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-article-detail',
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss']
})
export class ArticleDetailComponent implements OnInit, OnDestroy {
  article: Article | null = null;
  html = '';
  isLoading = true;
  loadError = false;
  private sub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private articleService: ArticleService,
    readonly i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe(params => this.load(params.get('slug') ?? ''));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private async load(slug: string): Promise<void> {
    this.isLoading = true;
    this.loadError = false;
    this.article = null;

    try {
      this.article = await this.articleService.getPublished(slug);
      this.html = this.article ? renderMarkdown(this.article.content) : '';
    } catch (error) {
      console.error('Unable to load article', error);
      this.loadError = true;
    } finally {
      this.isLoading = false;
    }
  }
}
