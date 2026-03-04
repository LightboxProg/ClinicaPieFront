import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListElementTextComponent } from './list-element-text.component';

describe('ListElementTextComponent', () => {
  let component: ListElementTextComponent;
  let fixture: ComponentFixture<ListElementTextComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListElementTextComponent]
    });
    fixture = TestBed.createComponent(ListElementTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
