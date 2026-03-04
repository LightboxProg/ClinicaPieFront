import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListMensajeComponent } from './list-mensaje.component';

describe('ListMensajeComponent', () => {
  let component: ListMensajeComponent;
  let fixture: ComponentFixture<ListMensajeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListMensajeComponent]
    });
    fixture = TestBed.createComponent(ListMensajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
