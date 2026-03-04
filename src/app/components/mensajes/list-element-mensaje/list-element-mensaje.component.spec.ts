import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListElementMensajeComponent } from './list-element-mensaje.component';

describe('ListElementMensajeComponent', () => {
  let component: ListElementMensajeComponent;
  let fixture: ComponentFixture<ListElementMensajeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListElementMensajeComponent]
    });
    fixture = TestBed.createComponent(ListElementMensajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
