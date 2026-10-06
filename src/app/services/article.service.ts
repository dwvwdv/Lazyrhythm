import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase.config';

export type ArticleStatus = 'draft' | 'published';
export type ArticleLang = 'zh-TW' | 'en';

export interface ArticleSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  cover_image_url: string | null;
  tags: string[];
  lang: ArticleLang;
  status: ArticleStatus;
  published_at: string | null;
  updated_at: string;
  author_name: string | null;
}

export interface Article extends ArticleSummary {
  content: string;
}

export interface ArticlePayload {
  slug: string;
  title: string;
  summary: string;
  content: string;
  cover_image_url: string | null;
  tags: string[];
  lang: ArticleLang;
  status: ArticleStatus;
}

const SUMMARY_COLUMNS = 'id,slug,title,summary,cover_image_url,tags,lang,status,published_at,updated_at,author_name';
const FULL_COLUMNS = `${SUMMARY_COLUMNS},content`;

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly baseUrl = `${SUPABASE_URL}/rest/v1`;

  constructor(private auth: AuthService) {}

  // ---- 公開讀取 ----

  async listPublished(): Promise<ArticleSummary[]> {
    return this.request<ArticleSummary[]>(
      `articles?select=${SUMMARY_COLUMNS}&status=eq.published&order=published_at.desc`
    );
  }

  /** 同一 slug 的所有已發布語系版本。 */
  async getPublishedVersions(slug: string): Promise<Article[]> {
    return this.request<Article[]>(
      `articles?select=${FULL_COLUMNS}&status=eq.published&slug=eq.${encodeURIComponent(slug)}`
    );
  }

  // ---- 作者 ----

  async isAuthor(): Promise<boolean> {
    const user = this.auth.user;
    if (!user) {
      return false;
    }

    const rows = await this.request<{ user_id: string }[]>(
      `authors?select=user_id&user_id=eq.${encodeURIComponent(user.id)}`,
      { authenticated: true }
    );
    return rows.length > 0;
  }

  async listAll(): Promise<ArticleSummary[]> {
    return this.request<ArticleSummary[]>(
      `articles?select=${SUMMARY_COLUMNS}&order=updated_at.desc`,
      { authenticated: true }
    );
  }

  async getById(id: string): Promise<Article | null> {
    const rows = await this.request<Article[]>(
      `articles?select=${FULL_COLUMNS}&id=eq.${encodeURIComponent(id)}&limit=1`,
      { authenticated: true }
    );
    return rows[0] ?? null;
  }

  async create(payload: ArticlePayload): Promise<Article> {
    const rows = await this.request<Article[]>(`articles?select=${FULL_COLUMNS}`, {
      authenticated: true,
      method: 'POST',
      body: payload
    });
    return this.single(rows);
  }

  async update(id: string, payload: ArticlePayload): Promise<Article> {
    const rows = await this.request<Article[]>(
      `articles?select=${FULL_COLUMNS}&id=eq.${encodeURIComponent(id)}`,
      { authenticated: true, method: 'PATCH', body: payload }
    );
    return this.single(rows);
  }

  async remove(id: string): Promise<void> {
    const rows = await this.request<{ id: string }[]>(
      `articles?select=id&id=eq.${encodeURIComponent(id)}`,
      { authenticated: true, method: 'DELETE' }
    );
    this.single(rows);
  }

  private single<T>(rows: T[]): T {
    // RLS 擋下時 PostgREST 只會回傳空陣列，沒有錯誤碼。
    if (!rows.length) {
      throw new Error('No row affected');
    }
    return rows[0];
  }

  private async request<T>(
    path: string,
    options: { authenticated?: boolean; method?: string; body?: unknown } = {}
  ): Promise<T> {
    let token = SUPABASE_ANON_KEY;
    if (options.authenticated) {
      const accessToken = await this.auth.getAccessToken();
      if (!accessToken) {
        throw new Error('Not signed in');
      }
      token = accessToken;
    }

    const headers: Record<string, string> = {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Accept-Profile': 'website',
      'Content-Profile': 'website'
    };

    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    if (options.method && options.method !== 'GET') {
      headers['Prefer'] = 'return=representation';
    }

    const response = await fetch(`${this.baseUrl}/${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
      throw new Error(`Article request failed (${response.status})`);
    }

    return response.json();
  }
}
