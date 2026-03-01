import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaliSahaComponent } from './hali-saha.component';

describe('HaliSahaComponent', () => {
  let component: HaliSahaComponent;
  let fixture: ComponentFixture<HaliSahaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HaliSahaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HaliSahaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
