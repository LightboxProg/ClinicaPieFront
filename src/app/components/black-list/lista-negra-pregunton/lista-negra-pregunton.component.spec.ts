import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaNegraPreguntonComponent } from './lista-negra-pregunton.component';

describe('ListaNegraPreguntonComponent', () => {
  let component: ListaNegraPreguntonComponent;
  let fixture: ComponentFixture<ListaNegraPreguntonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListaNegraPreguntonComponent]
    });
    fixture = TestBed.createComponent(ListaNegraPreguntonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
