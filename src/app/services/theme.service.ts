import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(this.isDarkMode());
  darkMode$ = this.darkMode.asObservable();

  constructor() {
    this.setDarkMode(this.isDarkMode());

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      if (localStorage.getItem('darkMode') === null) {
        this.setDarkMode(event.matches, false);
      }
    });
  }

  private isDarkMode(): boolean {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  setDarkMode(isDark: boolean, persist = true): void {
    this.darkMode.next(isDark);

    if (persist) {
      localStorage.setItem('darkMode', isDark.toString());
    }

    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }

  toggleTheme(): void {
    this.setDarkMode(!this.darkMode.value);
  }
}
