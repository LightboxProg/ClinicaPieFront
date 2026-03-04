import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementPacienteComponent } from './element-paciente.component';

describe('ElementPacienteComponent', () => {
  let component: ElementPacienteComponent;
  let fixture: ComponentFixture<ElementPacienteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ElementPacienteComponent]
    });
    fixture = TestBed.createComponent(ElementPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
