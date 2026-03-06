import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrosPreguntonComponent } from './filtros-pregunton.component';

describe('FiltrosPreguntonComponent', () => {
  let component: FiltrosPreguntonComponent;
  let fixture: ComponentFixture<FiltrosPreguntonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FiltrosPreguntonComponent]
    });
    fixture = TestBed.createComponent(FiltrosPreguntonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
