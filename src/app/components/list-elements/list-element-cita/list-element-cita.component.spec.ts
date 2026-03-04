import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListElementCitaComponent } from './list-element-cita.component';

describe('ListElementCitaComponent', () => {
  let component: ListElementCitaComponent;
  let fixture: ComponentFixture<ListElementCitaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListElementCitaComponent]
    });
    fixture = TestBed.createComponent(ListElementCitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
