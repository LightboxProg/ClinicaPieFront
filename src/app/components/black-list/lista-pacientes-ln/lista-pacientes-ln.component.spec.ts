import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPacientesLnComponent } from './lista-pacientes-ln.component';

describe('ListaPacientesLnComponent', () => {
  let component: ListaPacientesLnComponent;
  let fixture: ComponentFixture<ListaPacientesLnComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListaPacientesLnComponent]
    });
    fixture = TestBed.createComponent(ListaPacientesLnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
