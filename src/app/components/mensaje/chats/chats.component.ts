import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
export class ChatsComponent implements OnInit, OnDestroy {
  @ViewChild('chatBurbujas') chatBurbujas!: ContenedorChatComponent;

  chatsPacientes: any[] = [];
  chatsPreguntones: any[] = [];

  usuarioActivo: any = null;
  pestanaActiva: 'pacientes' | 'preguntones' = 'preguntones';

  private intervalo: any;

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.cargarBandeja();
    // Actualizar cada 5 segundos
    this.intervalo = setInterval(() => {
      this.actualizarPeriodicamente();
    }, 5000);
  }

  ngOnDestroy() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
  }

  cargarBandeja() {
    this.chatService.obtenerBandejaMensajes().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.chatsPacientes = res.chats.filter((c: any) => c.tipo === 'paciente');
          this.chatsPreguntones = res.chats.filter((c: any) => c.tipo === 'pregunton');
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  actualizarPeriodicamente() {
    this.cargarBandeja();
    // Si hay un chat activo, recargamos sus mensajes
    if (this.usuarioActivo && this.chatBurbujas) {
      this.chatBurbujas.cargarHistorial(this.usuarioActivo.idUsuario);
    }
  }

  abrirChat(usuario: any) {
    this.usuarioActivo = usuario;
  }

  cambiarStatusSaludos(usuario: any) {
    if (!usuario || !usuario.idUsuario) return;

    this.chatService.cambiarStatusSaludos(usuario.idUsuario).subscribe({
      next: (res) => {
        if (res.success) {
          console.log('Status cambiado a saludos');
          this.cargarBandeja();
        }
      },
      error: (err) => {
        console.error('Error al cambiar status', err);
      }
    });
  }
}