import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacientesListadosComponent } from './pacientes-listados.component';

describe('PacientesListadosComponent', () => {
  let component: PacientesListadosComponent;
  let fixture: ComponentFixture<PacientesListadosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PacientesListadosComponent]
    });
    fixture = TestBed.createComponent(PacientesListadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
