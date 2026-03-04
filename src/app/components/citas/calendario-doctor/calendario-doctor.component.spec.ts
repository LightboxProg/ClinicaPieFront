import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioDoctorComponent } from './calendario-doctor.component';

describe('CalendarioDoctorComponent', () => {
  let component: CalendarioDoctorComponent;
  let fixture: ComponentFixture<CalendarioDoctorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalendarioDoctorComponent]
    });
    fixture = TestBed.createComponent(CalendarioDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
