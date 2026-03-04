import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-pregunton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-pregunton.component.html',
  styleUrls: ['./chat-pregunton.component.scss']
})
export class ChatPreguntonComponent {
  // Recibe la lista desde el padre
  @Input() chats: any[] = [];

  // Emite un evento hacia el padre cuando se hace clic
  @Output() seleccionar = new EventEmitter<any>();
  @Output() cambiarStatusSaludos = new EventEmitter<any>();

  filtroEstado: string = 'todos'; // Estado seleccionado para filtrar
  private readonly UMBRAL_ROJO_HORAS = 48; // 2 días

  obtenerEstado(chat: any): string | null {
    if (chat.estado === 'contestado') {
      return 'verde';
    }
    if (chat.estado === 'pendiente') {
      const ahora = new Date().getTime();
      const fechaUltimo = new Date(chat.fecha).getTime();
      const diffHoras = (ahora - fechaUltimo) / (1000 * 60 * 60);
      return diffHoras <= this.UMBRAL_ROJO_HORAS ? 'amarillo' : 'rojo';
    }
    return null; // Por si algún chat no tiene estado definido
  }

  obtenerClaseEstado(chat: any): string {
    const estado = this.obtenerEstado(chat);
    return estado ? `estado-${estado}` : '';
  }

  get chatsFiltrados(): any[] {
    if (this.filtroEstado === 'todos') {
      return this.chats;
    }
    return this.chats.filter(chat => this.obtenerEstado(chat) === this.filtroEstado);
  }

  setFiltro(estado: string): void {
    this.filtroEstado = estado;
  }

  clickChat(chat: any) {
    this.seleccionar.emit(chat);
  }
}