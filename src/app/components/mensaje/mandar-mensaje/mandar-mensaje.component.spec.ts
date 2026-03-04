import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MandarMensajeComponent } from './mandar-mensaje.component';

describe('MandarMensajeComponent', () => {
  let component: MandarMensajeComponent;
  let fixture: ComponentFixture<MandarMensajeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MandarMensajeComponent]
    });
    fixture = TestBed.createComponent(MandarMensajeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
