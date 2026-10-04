import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { I18nService } from '../../i18n/i18n.service';
import { TranslatePipe } from '../../i18n/translate.pipe';

@Component({
    selector: 'app-navbar',
    imports: [CommonModule, RouterModule, TranslatePipe],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isDarkMode = false;
  isMenuOpen = false;

  constructor(
    private themeService: ThemeService,
    private i18n: I18nService
  ) {}

  ngOnInit() {
    this.themeService.darkMode$.subscribe(
      isDark => {
        this.isDarkMode = isDark;
      }
    );
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleLang() {
    this.i18n.toggle();
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
} 