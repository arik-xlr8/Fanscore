import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HalisahaDetayComponent } from './halisaha-detay.component';

describe('HalisahaDetayComponent', () => {
  let component: HalisahaDetayComponent;
  let fixture: ComponentFixture<HalisahaDetayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HalisahaDetayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HalisahaDetayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
