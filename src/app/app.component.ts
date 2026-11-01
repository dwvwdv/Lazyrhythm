import { Component, OnInit } from '@angular/core';
import { ThemeService } from './services/theme.service';
import { SeoService } from './services/seo.service';
import { FACEBOOK_URL, GITHUB_URL } from './services/seo.config';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {
  title = 'LazyRhythm';
  currentYear = new Date().getFullYear();
  isDarkMode = false;
  readonly facebookUrl = FACEBOOK_URL;
  readonly githubUrl = GITHUB_URL;

  constructor(private themeService: ThemeService, private seo: SeoService) {}

  ngOnInit() {
    this.seo.start();
    this.themeService.darkMode$.subscribe(
      isDark => this.isDarkMode = isDark
    );
  }
}
