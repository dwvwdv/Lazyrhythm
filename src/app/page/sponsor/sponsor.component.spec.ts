import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { SponsorComponent } from './sponsor.component';

describe('SponsorComponent', () => {
  let component: SponsorComponent;
  let fixture: ComponentFixture<SponsorComponent>;
  let copyButton: () => HTMLButtonElement;
  let status: () => HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SponsorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SponsorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    copyButton = () => fixture.nativeElement.querySelector('.address .btn');
    status = () => fixture.nativeElement.querySelector('.copy-status');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('copies the address and announces it, then resets', fakeAsync(() => {
    const write = spyOn(navigator.clipboard, 'writeText').and.resolveTo();
    copyButton().click();
    tick();
    fixture.detectChanges();
    expect(write).toHaveBeenCalledWith(component.bscAddress);
    expect(copyButton().classList).toContain('is-copied');
    expect(status().textContent?.trim()).not.toBe('');

    tick(2500);
    fixture.detectChanges();
    expect(component.copyState).toBe('idle');
    expect(status().textContent?.trim()).toBe('');
  }));

  it('selects the address for manual copying when the clipboard is unavailable', fakeAsync(() => {
    spyOn(navigator.clipboard, 'writeText').and.rejectWith(new Error('denied'));
    copyButton().click();
    tick();
    fixture.detectChanges();
    expect(component.copyState).toBe('failed');
    expect(status().classList).toContain('is-failed');
    expect(window.getSelection()?.toString()).toBe(component.bscAddress);
    tick(6000);
  }));
});
