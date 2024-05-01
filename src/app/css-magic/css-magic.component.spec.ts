import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CssMagicComponent } from './css-magic.component';

describe('CssMagicComponent', () => {
  let component: CssMagicComponent;
  let fixture: ComponentFixture<CssMagicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CssMagicComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CssMagicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
