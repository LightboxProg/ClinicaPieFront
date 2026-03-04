import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCitaComponent } from './list-cita.component';

describe('ListCitaComponent', () => {
  let component: ListCitaComponent;
  let fixture: ComponentFixture<ListCitaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListCitaComponent]
    });
    fixture = TestBed.createComponent(ListCitaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
