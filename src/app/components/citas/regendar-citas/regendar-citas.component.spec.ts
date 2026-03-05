import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegendarCitasComponent } from './regendar-citas.component';

describe('RegendarCitasComponent', () => {
  let component: RegendarCitasComponent;
  let fixture: ComponentFixture<RegendarCitasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegendarCitasComponent]
    });
    fixture = TestBed.createComponent(RegendarCitasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
