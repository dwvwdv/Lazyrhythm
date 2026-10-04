import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticleService, ArticleSummary } from '../../../services/article.service';
import { AuthService } from '../../../services/auth.service';
import { I18nService } from '../../../i18n/i18n.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-article-list',
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss']
})
export class ArticleListComponent implements OnInit {
  articles: ArticleSummary[] = [];
  isLoading = true;
  loadError = false;

  constructor(
    private articleService: ArticleService,
    readonly auth: AuthService,
    readonly i18n: I18nService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      this.articles = await this.articleService.listPublished();
    } catch (error) {
      console.error('Unable to load articles', error);
      this.loadError = true;
    } finally {
      this.isLoading = false;
    }
  }
}
