import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambioSucursalesComponent } from './cambio-sucursales.component';

describe('CambioSucursalesComponent', () => {
  let component: CambioSucursalesComponent;
  let fixture: ComponentFixture<CambioSucursalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CambioSucursalesComponent]
    });
    fixture = TestBed.createComponent(CambioSucursalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
