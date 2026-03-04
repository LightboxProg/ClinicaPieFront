import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListElementPhotoComponent } from './list-element-photo.component';

describe('ListElementPhotoComponent', () => {
  let component: ListElementPhotoComponent;
  let fixture: ComponentFixture<ListElementPhotoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListElementPhotoComponent]
    });
    fixture = TestBed.createComponent(ListElementPhotoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
