import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegendadoCitaComponent } from './regendado-cita.component';

describe('RegendadoCitaComponent', () => {
  let component: RegendadoCitaComponent;
  let fixture: ComponentFixture<RegendadoCitaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegendadoCitaComponent]
    });
    fixture = TestBed.createComponent(RegendadoCitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
