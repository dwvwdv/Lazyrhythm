import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(this.isDarkMode());
  darkMode$ = this.darkMode.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: string,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    const hasStoredPreference = this.readStored() !== null;
    this.setDarkMode(this.isDarkMode(), hasStoredPreference);
    if (!isPlatformBrowser(this.platformId)) return;

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      if (this.readStored() === null) {
        this.setDarkMode(event.matches, false);
      }
    });
  }

  private isDarkMode(): boolean {
    const stored = this.readStored();
    if (stored !== null) {
      return stored === 'true';
    }

    return isPlatformBrowser(this.platformId) && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private readStored(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    try {
      return localStorage.getItem('darkMode');
    } catch {
      return null;
    }
  }

  setDarkMode(isDark: boolean, persist = true): void {
    this.darkMode.next(isDark);

    if (persist && isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem('darkMode', isDark.toString());
      } catch {
        // Keep the current preference in memory when storage is unavailable.
      }
    }

    this.document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  toggleTheme(): void {
    this.setDarkMode(!this.darkMode.value);
  }
}
