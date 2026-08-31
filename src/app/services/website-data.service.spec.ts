import { TestBed } from '@angular/core/testing';
import { WebsiteDataService } from './website-data.service';

describe('WebsiteDataService', () => {
  it('should be created', () => {
    TestBed.configureTestingModule({});
    expect(TestBed.inject(WebsiteDataService)).toBeTruthy();
  });
});
