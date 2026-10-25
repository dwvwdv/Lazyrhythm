import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';

import { WorksComponent } from './works.component';
import { PUBLIC_CONTENT } from '../../services/public-content';
import { WebsiteDataService, WebsiteProjectRow } from '../../services/website-data.service';

const row: WebsiteProjectRow = {
  slug: 'hookfy', title: 'Hookfy', description: 'Notification webhooks', image_url: null, image_fit: 'contain',
  project_url: 'https://hookfy.example', category: 'automation', tags: ['Webhooks'], technologies: ['Flutter'],
  featured: true, sort_order: 1, translations: { 'zh-TW': { description: '通知轉發' } }
};

describe('WorksComponent', () => {
  let component: WorksComponent;
  let fixture: ComponentFixture<WorksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorksComponent],
      providers: [provideRouter([]), { provide: WebsiteDataService, useValue: { getProjects: () => Promise.resolve([row]) } }]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('WorksComponent prerendering', () => {
  it('renders the projects from the build into the initial HTML without a request', () => {
    const getProjects = jasmine.createSpy('getProjects');
    TestBed.configureTestingModule({
      imports: [WorksComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: WebsiteDataService, useValue: { getProjects } },
        { provide: PUBLIC_CONTENT, useValue: { projects: [row], articles: [] } }
      ]
    });
    const fixture = TestBed.createComponent(WorksComponent);
    fixture.detectChanges();
    const card: HTMLElement = fixture.nativeElement.querySelector('.project-card');
    expect(card.id).toBe('hookfy');
    expect(card.querySelector('.project-title')?.textContent).toBe('Hookfy');
    expect(fixture.componentInstance.isLoading).toBeFalse();
    expect(getProjects).not.toHaveBeenCalled();
    expect(card.querySelector('a[href^="/products/"]')).toBeNull();
  });

  it('links a project that has a product page to it with a plain link, keeping the external link', () => {
    TestBed.configureTestingModule({
      imports: [WorksComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: WebsiteDataService, useValue: { getProjects: jasmine.createSpy('getProjects') } },
        { provide: PUBLIC_CONTENT, useValue: { projects: [{ ...row, slug: 'seamless-track', title: 'Seamless Track' }], articles: [] } }
      ]
    });
    const fixture = TestBed.createComponent(WorksComponent);
    fixture.detectChanges();
    const card: HTMLElement = fixture.nativeElement.querySelector('.project-card');
    expect(card.querySelector('.project-title a')?.getAttribute('href')).toBe('/products/seamless-track');
    expect(card.querySelector('.details-btn')?.getAttribute('href')).toBe('/products/seamless-track');
    expect(card.querySelector(`a[href="${row.project_url}"]`)).not.toBeNull();
    expect(card.querySelector('img')?.getAttribute('src')).toBe('https://filedn.eu/lyWyjTiBuD9uWONu3Or0JNX/lazyrhythm/SeamlessTrack/website/%E4%BD%9C%E5%93%81%E5%8D%A1%E5%B0%81%E9%9D%A2%201600%C3%97900%401x.png');
    expect(card.querySelector('img')?.classList.contains('cover')).toBeTrue();
  });
});
