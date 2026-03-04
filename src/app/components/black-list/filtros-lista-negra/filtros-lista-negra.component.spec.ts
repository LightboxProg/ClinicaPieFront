import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrosListaNegraComponent } from './filtros-lista-negra.component';

describe('FiltrosListaNegraComponent', () => {
  let component: FiltrosListaNegraComponent;
  let fixture: ComponentFixture<FiltrosListaNegraComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FiltrosListaNegraComponent]
    });
    fixture = TestBed.createComponent(FiltrosListaNegraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
