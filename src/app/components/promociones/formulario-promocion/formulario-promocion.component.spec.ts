import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioPromocionComponent } from './formulario-promocion.component';

describe('FormularioPromocionComponent', () => {
  let component: FormularioPromocionComponent;
  let fixture: ComponentFixture<FormularioPromocionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormularioPromocionComponent]
    });
    fixture = TestBed.createComponent(FormularioPromocionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
