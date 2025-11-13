import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(this.isDarkMode());
  darkMode$ = this.darkMode.asObservable();

  constructor() {
    // 設置初始主題
    this.setDarkMode(this.isDarkMode());

    // 監聽系統主題變化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.setDarkMode(e.matches);
    });
  }

  private isDarkMode(): boolean {
    const stored = localStorage.getItem('darkMode');
    if (stored) {
      return stored === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  setDarkMode(isDark: boolean) {
    this.darkMode.next(isDark);
    localStorage.setItem('darkMode', isDark.toString());

    // 直接設置 document root 的 data-theme
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.style.backgroundColor = '#2a2d3a'; // Neumorphism dark background
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.style.backgroundColor = '#e0e5ec'; // Neumorphism light background
    }
  }

  toggleTheme() {
    this.setDarkMode(!this.darkMode.value);
  }
}
