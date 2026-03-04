import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrosPacientesComponent } from './filtros-pacientes.component';

describe('FiltrosPacientesComponent', () => {
  let component: FiltrosPacientesComponent;
  let fixture: ComponentFixture<FiltrosPacientesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FiltrosPacientesComponent]
    });
    fixture = TestBed.createComponent(FiltrosPacientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
