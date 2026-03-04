import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleRedirectComponent } from './role-redirect.component';

describe('RoleRedirectComponent', () => {
  let component: RoleRedirectComponent;
  let fixture: ComponentFixture<RoleRedirectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RoleRedirectComponent]
    });
    fixture = TestBed.createComponent(RoleRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
