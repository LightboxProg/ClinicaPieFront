import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCategoriaComponent } from './form-categoria.component';

describe('FormCategoriaComponent', () => {
  let component: FormCategoriaComponent;
  let fixture: ComponentFixture<FormCategoriaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormCategoriaComponent]
    });
    fixture = TestBed.createComponent(FormCategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
