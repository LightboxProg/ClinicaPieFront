import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatPacienteComponent } from './chat-paciente.component';

describe('ChatPacienteComponent', () => {
  let component: ChatPacienteComponent;
  let fixture: ComponentFixture<ChatPacienteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatPacienteComponent]
    });
    fixture = TestBed.createComponent(ChatPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
