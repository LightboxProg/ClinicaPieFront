import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorariosDoctorComponent } from './horarios-doctor.component';

describe('HorariosDoctorComponent', () => {
  let component: HorariosDoctorComponent;
  let fixture: ComponentFixture<HorariosDoctorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HorariosDoctorComponent]
    });
    fixture = TestBed.createComponent(HorariosDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
