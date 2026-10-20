import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';

import { WorksComponent } from './works.component';
import { PUBLIC_CONTENT } from '../../services/public-content';
import { WebsiteDataService, WebsiteProjectRow } from '../../services/website-data.service';

const row: WebsiteProjectRow = {
  slug: 'driftread', title: 'Driftread', description: 'RSS discovery', image_url: null, image_fit: 'contain',
  project_url: 'https://driftread.lazyrhythm.com', category: 'reading', tags: ['RSS'], technologies: ['Angular'],
  featured: true, sort_order: 1, translations: { 'zh-TW': { description: 'RSS 探索' } }
};

describe('WorksComponent', () => {
  let component: WorksComponent;
  let fixture: ComponentFixture<WorksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorksComponent],
      providers: [{ provide: WebsiteDataService, useValue: { getProjects: () => Promise.resolve([row]) } }]
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
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: WebsiteDataService, useValue: { getProjects } },
        { provide: PUBLIC_CONTENT, useValue: { projects: [row], articles: [] } }
      ]
    });
    const fixture = TestBed.createComponent(WorksComponent);
    fixture.detectChanges();
    const card: HTMLElement = fixture.nativeElement.querySelector('.project-card');
    expect(card.id).toBe('driftread');
    expect(card.querySelector('.project-title')?.textContent).toBe('Driftread');
    expect(fixture.componentInstance.isLoading).toBeFalse();
    expect(getProjects).not.toHaveBeenCalled();
  });
});
