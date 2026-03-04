import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaSucursalesComponent } from './agenda-sucursales.component';

describe('AgendaSucursalesComponent', () => {
  let component: AgendaSucursalesComponent;
  let fixture: ComponentFixture<AgendaSucursalesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AgendaSucursalesComponent]
    });
    fixture = TestBed.createComponent(AgendaSucursalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
