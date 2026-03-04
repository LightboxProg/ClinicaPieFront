import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatPreguntonComponent } from './chat-pregunton.component';

describe('ChatPreguntonComponent', () => {
  let component: ChatPreguntonComponent;
  let fixture: ComponentFixture<ChatPreguntonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatPreguntonComponent]
    });
    fixture = TestBed.createComponent(ChatPreguntonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
