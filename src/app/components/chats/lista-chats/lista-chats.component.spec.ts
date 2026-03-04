import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaChatsComponent } from './lista-chats.component';

describe('ListaChatsComponent', () => {
  let component: ListaChatsComponent;
  let fixture: ComponentFixture<ListaChatsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListaChatsComponent]
    });
    fixture = TestBed.createComponent(ListaChatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
