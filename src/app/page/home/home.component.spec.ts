import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';
import { PUBLIC_CONTENT } from '../../services/public-content';
import { WebsiteDataService, WebsiteProjectRow } from '../../services/website-data.service';

function project(slug: string, featured: boolean): WebsiteProjectRow {
  return { slug, title: slug, description: `${slug} description`, image_url: null, image_fit: 'contain', project_url: `https://example.com/${slug}`,
    category: 'reading', tags: [], technologies: [], featured, sort_order: 0, translations: null };
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), { provide: WebsiteDataService, useValue: { getProjects: () => Promise.resolve([project('loaded', true)]) } }]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the featured projects on a client-side visit', async () => {
    // The hero animation keeps the zone busy, so wait for the stubbed request instead of stability.
    await new Promise(resolve => setTimeout(resolve));
    expect(component.products.map(product => product.id)).toEqual(['loaded']);
  });
});

describe('HomeComponent prerendering', () => {
  it('lists only the featured projects from the build without a request', () => {
    const getProjects = jasmine.createSpy('getProjects');
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: WebsiteDataService, useValue: { getProjects } },
        { provide: PUBLIC_CONTENT, useValue: { projects: [project('seamless-track', true), project('hookfy', true), project('hidden', false)], articles: [] } }
      ]
    });
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const items = Array.from(fixture.nativeElement.querySelectorAll('.product-title a') as NodeListOf<HTMLAnchorElement>);
    expect(items.map(item => item.textContent?.trim())).toEqual(['seamless-track', 'hookfy']);
    // A product page when the project has one, else the project's card on /works.
    expect(items[0].getAttribute('href')).toBe('/products/seamless-track');
    expect(items[1].getAttribute('href')).toBe('/works#hookfy');
    expect(getProjects).not.toHaveBeenCalled();
  });
});
