import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from 'src/app/components/chats/chat/chat.component';
import { ListaChatsComponent } from 'src/app/components/chats/lista-chats/lista-chats.component';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule,ChatComponent,ListaChatsComponent],
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent {

}
