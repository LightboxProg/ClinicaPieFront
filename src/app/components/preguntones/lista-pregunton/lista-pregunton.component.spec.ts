import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaPreguntonComponent } from './lista-pregunton.component';

describe('ListaPreguntonComponent', () => {
  let component: ListaPreguntonComponent;
  let fixture: ComponentFixture<ListaPreguntonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListaPreguntonComponent]
    });
    fixture = TestBed.createComponent(ListaPreguntonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
