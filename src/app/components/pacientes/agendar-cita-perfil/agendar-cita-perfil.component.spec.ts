import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendarCitaPerfilComponent } from './agendar-cita-perfil.component';

describe('AgendarCitaPerfilComponent', () => {
  let component: AgendarCitaPerfilComponent;
  let fixture: ComponentFixture<AgendarCitaPerfilComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AgendarCitaPerfilComponent]
    });
    fixture = TestBed.createComponent(AgendarCitaPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
