import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDoctorComponent } from './form-doctor.component';

describe('FormDoctorComponent', () => {
  let component: FormDoctorComponent;
  let fixture: ComponentFixture<FormDoctorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormDoctorComponent]
    });
    fixture = TestBed.createComponent(FormDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
