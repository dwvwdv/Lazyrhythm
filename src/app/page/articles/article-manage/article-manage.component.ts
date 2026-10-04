import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ArticleService, ArticleSummary } from '../../../services/article.service';
import { AuthService } from '../../../services/auth.service';
import { I18nService } from '../../../i18n/i18n.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';

@Component({
  selector: 'app-article-manage',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './article-manage.component.html',
  styleUrls: ['./article-manage.component.scss']
})
export class ArticleManageComponent implements OnInit {
  loginForm: FormGroup;
  isSigningIn = false;
  loginError = false;

  isAuthor = false;
  notAuthor = false;
  articles: ArticleSummary[] = [];
  isLoading = false;
  errorKey: string | null = null;

  constructor(
    fb: FormBuilder,
    readonly auth: AuthService,
    readonly i18n: I18nService,
    private articleService: ArticleService
  ) {
    this.loginForm = fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    if (this.auth.user) {
      await this.loadDesk();
    }
  }

  async signIn(): Promise<void> {
    if (this.loginForm.invalid || this.isSigningIn) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSigningIn = true;
    this.loginError = false;

    try {
      const { email, password } = this.loginForm.getRawValue();
      await this.auth.signIn(email.trim(), password);
      this.loginForm.reset({ email: '', password: '' });
      await this.loadDesk();
    } catch (error) {
      console.error('Unable to sign in', error);
      this.loginError = true;
    } finally {
      this.isSigningIn = false;
    }
  }

  async signOut(): Promise<void> {
    await this.auth.signOut();
    this.isAuthor = false;
    this.notAuthor = false;
    this.articles = [];
  }

  async remove(article: ArticleSummary): Promise<void> {
    if (!confirm(this.i18n.t('manage.confirmDelete'))) {
      return;
    }

    try {
      await this.articleService.remove(article.id);
      this.articles = this.articles.filter(item => item.id !== article.id);
    } catch (error) {
      console.error('Unable to delete article', error);
      this.errorKey = 'manage.deleteError';
    }
  }

  private async loadDesk(): Promise<void> {
    this.isLoading = true;
    this.errorKey = null;

    try {
      this.isAuthor = await this.articleService.isAuthor();
      this.notAuthor = !this.isAuthor;
      this.articles = this.isAuthor ? await this.articleService.listAll() : [];
    } catch (error) {
      console.error('Unable to load article desk', error);
      this.errorKey = 'manage.loadError';
    } finally {
      this.isLoading = false;
    }
  }
}
