import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from 'src/app/services/chat.service';
@Component({
  selector: 'app-mandar-mensaje',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mandar-mensaje.component.html',
  styleUrls: ['./mandar-mensaje.component.scss']
})
export class MandarMensajeComponent {
  @Input() usuario: any;
  // Agregamos un Output para avisarle al padre que recargue el chat después de enviar
  @Output() mensajeEnviado = new EventEmitter<void>(); 
  
  textoMensaje: string = '';

  constructor(private chatService: ChatService) {}

  enviarMensaje() {
    if (!this.textoMensaje.trim() || !this.usuario) return;

    const mensajeAEnviar = this.textoMensaje; // Guardamos el texto
    this.textoMensaje = ''; // Limpiamos el input instantáneamente (mejor experiencia de usuario)

    // Llamamos a la función que agregaste en el servicio
    this.chatService.responderDesdeCRM(this.usuario.idUsuario, this.usuario.telefono, mensajeAEnviar)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            console.log("Mensaje enviado exitosamente a la base de datos y a n8n");
            // Le avisamos al componente contenedor que recargue las burbujas
            this.mensajeEnviado.emit(); 
          }
        },
        error: (err: any) => {
          console.error("Error al enviar el mensaje", err);
          this.textoMensaje = mensajeAEnviar; // Si falla, le regresamos el texto al doctor para que no lo pierda
        }
      });
  }
}