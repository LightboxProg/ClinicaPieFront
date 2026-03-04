import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MensajesMasivosComponent } from './mensajes-masivos.component';

describe('MensajesMasivosComponent', () => {
  let component: MensajesMasivosComponent;
  let fixture: ComponentFixture<MensajesMasivosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MensajesMasivosComponent]
    });
    fixture = TestBed.createComponent(MensajesMasivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
