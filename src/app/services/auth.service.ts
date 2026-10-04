import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './supabase.config';

export interface AuthUser {
  id: string;
  email: string;
}

interface StoredSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch seconds
  user: AuthUser;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  user: { id: string; email?: string };
}

const STORAGE_KEY = 'lr-auth-session';
const REFRESH_MARGIN_SECONDS = 60;

/** 以 Supabase Auth (GoTrue) REST API 實作的精簡登入流程，僅供文章作者使用。 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private session: StoredSession | null = this.readSession();
  private refreshing: Promise<StoredSession | null> | null = null;
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.session?.user ?? null);
  readonly user$ = this.userSubject.asObservable();

  get user(): AuthUser | null {
    return this.userSubject.value;
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error(`Sign in failed (${response.status})`);
    }

    return this.storeSession(await response.json()).user;
  }

  async signOut(): Promise<void> {
    const token = this.session?.accessToken;
    this.clearSession();

    if (token) {
      try {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` }
        });
      } catch {
        // 本地 session 已清除，伺服器端登出失敗不影響使用者。
      }
    }
  }

  /** 取得有效的 access token；快過期時自動 refresh，失敗則登出。 */
  async getAccessToken(): Promise<string | null> {
    if (!this.session) {
      return null;
    }

    if (this.session.expiresAt - REFRESH_MARGIN_SECONDS > Date.now() / 1000) {
      return this.session.accessToken;
    }

    this.refreshing ??= this.refresh().finally(() => (this.refreshing = null));
    return (await this.refreshing)?.accessToken ?? null;
  }

  private async refresh(): Promise<StoredSession | null> {
    const refreshToken = this.session?.refreshToken;
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!response.ok) {
        throw new Error(`Refresh failed (${response.status})`);
      }

      return this.storeSession(await response.json());
    } catch (error) {
      console.error('Unable to refresh session', error);
      this.clearSession();
      return null;
    }
  }

  private storeSession(token: TokenResponse): StoredSession {
    const session: StoredSession = {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: token.expires_at ?? Math.floor(Date.now() / 1000) + token.expires_in,
      user: { id: token.user.id, email: token.user.email ?? '' }
    };

    this.session = session;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // storage 不可用時 session 只保留在記憶體中。
    }
    this.userSubject.next(session.user);
    return session;
  }

  private clearSession(): void {
    this.session = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    this.userSubject.next(null);
  }

  private readSession(): StoredSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) as StoredSession : null;
      return parsed?.accessToken && parsed.refreshToken && parsed.user?.id ? parsed : null;
    } catch {
      return null;
    }
  }
}
