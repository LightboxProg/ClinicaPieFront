import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPromocionesComponent } from './lista-promociones.component';

describe('ListaPromocionesComponent', () => {
  let component: ListaPromocionesComponent;
  let fixture: ComponentFixture<ListaPromocionesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListaPromocionesComponent]
    });
    fixture = TestBed.createComponent(ListaPromocionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
