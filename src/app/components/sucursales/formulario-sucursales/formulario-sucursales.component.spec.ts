import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioSucursalesComponent } from './formulario-sucursales.component';

describe('FormularioSucursalesComponent', () => {
  let component: FormularioSucursalesComponent;
  let fixture: ComponentFixture<FormularioSucursalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormularioSucursalesComponent]
    });
    fixture = TestBed.createComponent(FormularioSucursalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
