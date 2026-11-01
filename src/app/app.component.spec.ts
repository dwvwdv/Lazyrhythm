import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { TranslatePipe } from './i18n/translate.pipe';
import { NavbarComponent } from './widgets/navbar/navbar.component';
import { SnakeCursorComponent } from './widgets/snake-cursor/snake-cursor.component';
import { SeoService } from './services/seo.service';
import { FACEBOOK_URL, GITHUB_URL } from './services/seo.config';
import { LangSuggestComponent } from './widgets/lang-suggest/lang-suggest.component';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [RouterTestingModule, TranslatePipe, NavbarComponent, SnakeCursorComponent, LangSuggestComponent],
    declarations: [AppComponent]
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('starts route metadata when the app initializes', () => {
    const start = spyOn(TestBed.inject(SeoService), 'start');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(start).toHaveBeenCalledTimes(1);
  });

  it('renders the public navigation and branded footer', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-navbar')).not.toBeNull();
    expect(compiled.querySelector('main router-outlet')).not.toBeNull();
    expect(compiled.querySelector('footer')?.textContent).toContain('LazyRhythm');
  });

  it('links the Facebook page and GitHub from the footer in a new tab', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const links = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('footer a'));
    expect(links.map(a => a.getAttribute('href'))).toEqual([FACEBOOK_URL, GITHUB_URL]);
    for (const a of links) {
      expect(a.target).toBe('_blank');
      expect(a.rel).toContain('noopener');
    }
  });
});
