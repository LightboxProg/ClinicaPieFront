import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaHorariosComponent } from './lista-horarios.component';

describe('ListaHorariosComponent', () => {
  let component: ListaHorariosComponent;
  let fixture: ComponentFixture<ListaHorariosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListaHorariosComponent]
    });
    fixture = TestBed.createComponent(ListaHorariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
