import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElementPreguntonComponent } from './element-pregunton.component';

describe('ElementPreguntonComponent', () => {
  let component: ElementPreguntonComponent;
  let fixture: ComponentFixture<ElementPreguntonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ElementPreguntonComponent]
    });
    fixture = TestBed.createComponent(ElementPreguntonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
