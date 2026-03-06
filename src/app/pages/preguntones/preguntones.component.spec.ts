import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreguntonesComponent } from './preguntones.component';

describe('PreguntonesComponent', () => {
  let component: PreguntonesComponent;
  let fixture: ComponentFixture<PreguntonesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PreguntonesComponent]
    });
    fixture = TestBed.createComponent(PreguntonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
