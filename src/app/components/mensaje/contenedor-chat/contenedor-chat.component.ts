import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from 'src/app/services/chat.service'; 


@Component({
  selector: 'app-contenedor-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contenedor-chat.component.html',
  styleUrls: ['./contenedor-chat.component.scss']
})
export class ContenedorChatComponent implements OnChanges {
  // Recibe el usuario seleccionado desde el padre
  @Input() usuario: any;
  
  historial: any[] = [];

  constructor(private chatService: ChatService) {}

  // Se ejecuta automáticamente cada vez que el @Input() cambia
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuario'] && this.usuario) {
      this.cargarHistorial(this.usuario.idUsuario);
    }
  }

  cargarHistorial(idUsuario: string) {
    this.chatService.obtenerHistorialChat(idUsuario).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.historial = res.chat;
        }
      }
    });
  }
}