import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloqueoSucursalComponent } from './bloqueo-sucursal.component';

describe('BloqueoSucursalComponent', () => {
  let component: BloqueoSucursalComponent;
  let fixture: ComponentFixture<BloqueoSucursalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BloqueoSucursalComponent]
    });
    fixture = TestBed.createComponent(BloqueoSucursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
