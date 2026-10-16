import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { TranslatePipe } from './i18n/translate.pipe';
import { NavbarComponent } from './widgets/navbar/navbar.component';
import { SnakeCursorComponent } from './widgets/snake-cursor/snake-cursor.component';
import { SeoService } from './services/seo.service';

describe('AppComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [RouterTestingModule, TranslatePipe, NavbarComponent, SnakeCursorComponent],
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
});
