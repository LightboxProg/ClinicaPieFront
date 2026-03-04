import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from 'src/app/services/chat.service';

import { ChatPacienteComponent } from '../chat-paciente/chat-paciente.component';
import { ChatPreguntonComponent } from '../chat-pregunton/chat-pregunton.component';
import { ContenedorChatComponent } from '../contenedor-chat/contenedor-chat.component';
import { MandarMensajeComponent } from '../mandar-mensaje/mandar-mensaje.component';

@Component({
  selector: 'app-chats',
  standalone: true,
  imports: [CommonModule, ChatPacienteComponent, ChatPreguntonComponent, ContenedorChatComponent, MandarMensajeComponent],
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.scss']
})
export class ChatsComponent implements OnInit {
  chatsPacientes: any[] = [];
  chatsPreguntones: any[] = [];

  usuarioActivo: any = null;
  // 🌟 CORRECCIÓN: Le quitamos la 'ñ'
  pestanaActiva: 'pacientes' | 'preguntones' = 'preguntones';

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.cargarBandeja();
  }

  cargarBandeja() {
    this.chatService.obtenerBandejaMensajes().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.chatsPacientes = res.chats.filter((c: any) => c.tipo === 'paciente');
          this.chatsPreguntones = res.chats.filter((c: any) => c.tipo === 'pregunton');
        }
      },
      error: (err: any) => console.error(err) // 🌟 Le agregué ': any' para que no marque error estricto
    });
  }

  abrirChat(usuario: any) {
    this.usuarioActivo = usuario;
  }


  cambiarStatusSaludos(usuario: any) {
    if (!usuario || !usuario.idUsuario) return;

    this.chatService.cambiarStatusSaludos(usuario.idUsuario).subscribe({
      next: (res) => {
        if (res.success) {
          // Opcional: mostrar notificación de éxito
          console.log('Status cambiado a saludos');
          // Recargar la bandeja para actualizar (si el status afectara la lista)
          this.cargarBandeja();
        }
      },
      error: (err) => {
        console.error('Error al cambiar status', err);
        // Manejar error (mostrar mensaje al usuario)
      }
    });
  }
}