import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrosMensajesComponent } from './filtros-mensajes.component';

describe('FiltrosMensajesComponent', () => {
  let component: FiltrosMensajesComponent;
  let fixture: ComponentFixture<FiltrosMensajesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FiltrosMensajesComponent]
    });
    fixture = TestBed.createComponent(FiltrosMensajesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
