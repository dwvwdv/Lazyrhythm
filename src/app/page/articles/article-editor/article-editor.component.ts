import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { Article, ArticleLang, ArticlePayload, ArticleService, ArticleStatus } from '../../../services/article.service';
import { renderMarkdown } from '../../../services/markdown';
import { I18nService } from '../../../i18n/i18n.service';
import { TranslatePipe } from '../../../i18n/translate.pipe';

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MAX_TAGS = 12;

export function slugify(title: string): string {
  return title
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '');
}

export function parseTags(raw: string): string[] {
  const tags = (raw ?? '')
    .split(/[,，、]/)
    .map(tag => tag.trim().replace(/^#/, '').slice(0, 40))
    .filter(Boolean);
  return [...new Set(tags)].slice(0, MAX_TAGS);
}

@Component({
  selector: 'app-article-editor',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './article-editor.component.html',
  styleUrls: ['./article-editor.component.scss']
})
export class ArticleEditorComponent implements OnInit, OnDestroy {
  form: FormGroup;
  articleId: string | null = null;
  status: ArticleStatus = 'draft';
  mode: 'write' | 'preview' = 'write';
  previewHtml = '';

  isLoading = false;
  isSaving = false;
  messageKey: string | null = null;
  isError = false;

  private slugTouched = false;
  private readonly fallbackSlug = `log-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6)}`;
  private subs = new Subscription();

  constructor(
    fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private i18n: I18nService
  ) {
    this.form = fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      slug: ['', [Validators.required, Validators.maxLength(120), Validators.pattern(SLUG_PATTERN)]],
      summary: ['', Validators.maxLength(500)],
      cover_image_url: ['', Validators.pattern(/^https:\/\/\S+$/)],
      tags: [''],
      lang: [this.i18n.lang as ArticleLang],
      content: ['', Validators.maxLength(100000)]
    });
  }

  get isNew(): boolean {
    return this.articleId === null;
  }

  ngOnInit(): void {
    this.subs.add(this.form.controls['title'].valueChanges.subscribe(title => {
      if (this.isNew && !this.slugTouched) {
        this.form.controls['slug'].setValue(slugify(title) || this.fallbackSlug, { emitEvent: false });
      }
    }));

    this.subs.add(this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.load(id);
      }
    }));

    const translateFrom = this.route.snapshot.queryParamMap.get('translate');
    if (this.isNew && translateFrom) {
      this.loadTranslationSource(translateFrom);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  markSlugTouched(): void {
    this.slugTouched = true;
  }

  setMode(mode: 'write' | 'preview'): void {
    this.mode = mode;
    if (mode === 'preview') {
      this.previewHtml = renderMarkdown(this.form.controls['content'].value);
    }
  }

  async save(status: ArticleStatus): Promise<void> {
    if (this.isSaving) {
      return;
    }

    const value = this.form.getRawValue();
    const title = (value.title ?? '').trim();
    if (this.form.invalid || !title) {
      this.form.markAllAsTouched();
      this.showMessage('editor.invalid', true);
      return;
    }

    const payload: ArticlePayload = {
      title,
      slug: value.slug.trim(),
      summary: (value.summary ?? '').trim(),
      content: value.content ?? '',
      cover_image_url: (value.cover_image_url ?? '').trim() || null,
      tags: parseTags(value.tags),
      lang: value.lang,
      status
    };

    this.isSaving = true;
    this.messageKey = null;

    try {
      if (this.isNew) {
        const created = await this.articleService.create(payload);
        await this.router.navigate(['/articles/manage', created.id], { replaceUrl: true });
      } else {
        this.apply(await this.articleService.update(this.articleId!, payload));
      }
      this.showMessage('editor.saved', false);
    } catch (error) {
      console.error('Unable to save article', error);
      this.showMessage('editor.saveError', true);
    } finally {
      this.isSaving = false;
    }
  }

  private async load(id: string): Promise<void> {
    this.isLoading = true;
    this.articleId = id;

    try {
      const article = await this.articleService.getById(id);
      if (!article) {
        throw new Error('Article not found');
      }
      this.apply(article);
    } catch (error) {
      console.error('Unable to load article', error);
      this.showMessage('editor.loadError', true);
    } finally {
      this.isLoading = false;
    }
  }

  /** 新增翻譯版本：沿用原文的 slug 與內容當作起點，語系切到另一種。 */
  private async loadTranslationSource(id: string): Promise<void> {
    this.isLoading = true;

    try {
      const source = await this.articleService.getById(id);
      if (!source) {
        throw new Error('Article not found');
      }

      this.slugTouched = true;
      this.form.reset({
        title: source.title,
        slug: source.slug,
        summary: source.summary,
        cover_image_url: source.cover_image_url ?? '',
        tags: source.tags.join(', '),
        lang: source.lang === 'zh-TW' ? 'en' : 'zh-TW',
        content: source.content
      }, { emitEvent: false });
    } catch (error) {
      console.error('Unable to load translation source', error);
      this.showMessage('editor.loadError', true);
    } finally {
      this.isLoading = false;
    }
  }

  private apply(article: Article): void {
    this.articleId = article.id;
    this.status = article.status;
    this.form.reset({
      title: article.title,
      slug: article.slug,
      summary: article.summary,
      cover_image_url: article.cover_image_url ?? '',
      tags: article.tags.join(', '),
      lang: article.lang,
      content: article.content
    }, { emitEvent: false });

    if (this.mode === 'preview') {
      this.previewHtml = renderMarkdown(article.content);
    }
  }

  private showMessage(key: string, isError: boolean): void {
    this.messageKey = key;
    this.isError = isError;
  }
}
