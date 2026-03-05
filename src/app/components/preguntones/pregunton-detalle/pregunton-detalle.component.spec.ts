import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreguntonDetalleComponent } from './pregunton-detalle.component';

describe('PreguntonDetalleComponent', () => {
  let component: PreguntonDetalleComponent;
  let fixture: ComponentFixture<PreguntonDetalleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PreguntonDetalleComponent]
    });
    fixture = TestBed.createComponent(PreguntonDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
