import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioDoctorPageComponent } from './calendario-doctor-page.component';

describe('CalendarioDoctorPageComponent', () => {
  let component: CalendarioDoctorPageComponent;
  let fixture: ComponentFixture<CalendarioDoctorPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalendarioDoctorPageComponent]
    });
    fixture = TestBed.createComponent(CalendarioDoctorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
