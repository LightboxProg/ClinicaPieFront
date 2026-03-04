import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaSucursalesComponent } from './lista-sucursales.component';

describe('ListaSucursalesComponent', () => {
  let component: ListaSucursalesComponent;
  let fixture: ComponentFixture<ListaSucursalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListaSucursalesComponent]
    });
    fixture = TestBed.createComponent(ListaSucursalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
