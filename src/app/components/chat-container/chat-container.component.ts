import { Component, OnInit, ViewChild, ElementRef, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { MensajesService } from 'src/app/services/mensajes.service';
import { UserService } from 'src/app/services/user.service';
import { LoginService } from 'src/app/services/login.service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-container.component.html',
  styleUrls: ['./chat-container.component.scss']
})

export class ChatContainerComponent implements OnInit {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  contacts: any[] = []; // Lista de pacientes asociados al doctor
  selectedContact: any = null; // Paciente seleccionado
  credentials: any; // Credenciales del usuario autenticado
  messageText: string = '';
  intervalId: any;

  constructor(
    private mensajesService: MensajesService,
    private userService: UserService,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Obtener las credenciales del usuario autenticado
    const user = this.loginService.obtenerUsuario();
    this.credentials = user?.usuario;

    // Si el usuario es un doctor, obtener los pacientes asociados
    if (this.credentials.tipo === 'Doctor' || this.credentials.tipo === 'Recepcionista' || this.credentials?.tipo === 'Administrador' || this.credentials.tipo === 'Administrador') {
      this.userService.getIdsPacientes(this.credentials.id).subscribe((pacientes: any) => {
        // Obtener los IDs de los pacientes
        const idsPacientes = pacientes.idPacientes;

        // Verificar que idsPacientes sea un arreglo de strings
        if (Array.isArray(idsPacientes)) {
          // Obtener los mensajes filtrados para los pacientes
          this.mensajesService.obtenerMensajesFiltrado('', idsPacientes).subscribe((mensajes: any) => {
            // Filtrar mensajes en el frontend (opcional, si el backend no lo hace)
            const mensajesFiltrados = mensajes.filter((mensaje: any) =>
              idsPacientes.includes(mensaje.idPaciente)
            );

            // Organizar los mensajes por paciente
            this.contacts = this.organizarMensajesPorPaciente(mensajesFiltrados);
            this.buscarChatDesdeLocalStorage();
          });
        } else {
          console.error('idsPacientes no es un arreglo válido:', idsPacientes);
        }
      });
      this.iniciarPollingMensajes();
    }

  }
  refrescarMensajes(): void {
    if (this.credentials?.tipo !== 'Doctor' || this.credentials?.tipo !== 'Recepcionista' || this.credentials?.tipo === 'Administrador' || this.credentials?.tipo !== 'Administrador' ) return;

    this.userService.getIdsPacientes(this.credentials.id).subscribe((pacientes: any) => {
      const idsPacientes = pacientes.idPacientes;

      if (Array.isArray(idsPacientes)) {
        this.mensajesService.obtenerMensajesFiltrado('', idsPacientes).subscribe((mensajes: any) => {
          const mensajesFiltrados = mensajes.filter((mensaje: any) =>
            idsPacientes.includes(mensaje.idPaciente)
          );

          this.contacts = this.organizarMensajesPorPaciente(mensajesFiltrados);

          // Si había un contacto seleccionado, volver a seleccionarlo con sus mensajes actualizados
          if (this.selectedContact) {
            const contactoActualizado = this.contacts.find(c => c.id === this.selectedContact.id);
            if (contactoActualizado) {
              this.selectContact(contactoActualizado);
            }
          }
        });
      }
    });
  }

  // Función para organizar los mensajes por paciente
  organizarMensajesPorPaciente(mensajes: any[]): any[] {
    const pacientesMap = new Map<string, any>();

    mensajes.forEach((mensaje) => {
      if (!pacientesMap.has(mensaje.idPaciente)) {
        pacientesMap.set(mensaje.idPaciente, {
          id: mensaje.idPaciente,
          name: mensaje.nombrePaciente,
          phone: mensaje.telefono,
          messages: [],
          alertaEstado: 'ninguno',
        });
      }

      const paciente = pacientesMap.get(mensaje.idPaciente); // 👈 aquí defines la variable correctamente

      paciente.messages.push({
        id: mensaje.idPaciente,
        text: mensaje.mensaje,
        sender: 'patient',
        fecha: mensaje.fecha,
        estado: mensaje.estado
      });
      console.log('Mensaje agregado:', mensaje.fecha);
      console.log('Mensaje agregado:', mensaje.estado);
      console.log('Mensaje agregado:', mensaje.idPaciente);
      paciente.messages.sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    });

    for (const paciente of pacientesMap.values()) {
      const mensajes = paciente.messages;

      if (mensajes.length === 0) continue;

      const ultimo = mensajes[mensajes.length - 1];

      if (ultimo.sender === 'patient') {
        const fechaMensaje = new Date(ultimo.fecha).getTime();
        const unaHora = 60 * 60 * 1000;
        const ahora = Date.now();

        if (ultimo.estado === 'atendido') {
          paciente.alertaEstado = 'atendido'; // blanco
        } else if (ultimo.sender === 'patient') {
          if (ultimo.estado === 'urgente') {
            paciente.alertaEstado = 'urgente'; // rojo
          } else if (ultimo.estado === 'noleido' && ahora - fechaMensaje > unaHora) {
            paciente.alertaEstado = 'noleido-viejo'; // amarillo
          } else if (ultimo.estado === 'noleido') {
            paciente.alertaEstado = 'noleido'; // gris
          } else {
            paciente.alertaEstado = 'noleido'; // por defecto
          }
        } else {
          paciente.alertaEstado = 'atendido';
        }
      }
    }


    return Array.from(pacientesMap.values());
  }


  // Función para seleccionar un contacto (paciente)
  selectContact(contact: any): void {
    // Reiniciar los mensajes del contacto seleccionado
    contact.messages = [];

    // Cargar mensajes del paciente
    this.mensajesService.obtenerMensajesPorPacient(contact.id).subscribe((mensajesPaciente: any) => {
      mensajesPaciente.forEach((msg: any) => {
        contact.messages.push({
          id: msg._id,
          text: msg.mensaje,
          sender: 'patient', // Mensajes del paciente
          fecha: msg.fecha, // Asegúrate de que el mensaje tenga una propiedad fecha
          estado: msg.estado
        });
      });

      // Cargar mensajes del doctor
      this.mensajesService.obtenerMensajesDoctor(this.credentials.id, contact.id).subscribe((mensajesDoctor: any) => {
        mensajesDoctor.forEach((msg: any) => {
          contact.messages.push({
            id: msg._id,
            text: msg.mensaje,
            sender: 'doctor', // Mensajes del doctor
            fecha: msg.fecha, // Asegúrate de que el mensaje tenga una propiedad fecha
            estado: msg.estado,
          });
        });

        // Ordenar los mensajes por fecha
        contact.messages.sort((a: any, b: any) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

        // Asignar el contacto seleccionado
        this.selectedContact = contact;
        this.scrollBottom();
      });
    });

    // Mostrar la información del paciente en la consola
    console.log('Nombre del paciente:', contact.name);
    console.log('Id del paciente:', contact.id);
    console.log('Número telefónico del paciente:', contact.phone);
    console.log('-----------------');
  }

  deselectContact(): void {
    this.selectedContact = null;
  }

  // Función para enviar un mensaje
  sendMessage(): void {
    if (this.selectedContact && this.messageText.trim()) {
      const nuevoMensaje = {
        idDoctor: this.credentials.id,
        idPaciente: this.selectedContact.id,
        mensaje: this.messageText,
      };

      // Enviar el mensaje al backend
      this.mensajesService.enviarMensajeDoctor(nuevoMensaje).subscribe(
        (response) => {
          console.log('Mensaje enviado:', response);
          const nuevoMensajeEnviado = {
            id: response.mensajeId,
            text: this.messageText,
            sender: 'doctor',
            fecha: new Date().toISOString(),
          };
          // Agregar el mensaje a la lista de mensajes del contacto seleccionado
          this.selectedContact.messages.push({
            text: this.messageText,
            sender: 'doctor', // Indicar que el mensaje es del doctor
            fecha: new Date().toISOString(),
          });
          this.messageText = ''; // Limpiar el campo de texto
          this.marcarMensajeComoAtendido();
          this.scrollBottom();
          this.contacts = [...this.contacts];
          this.cdr.detectChanges();
          this.refrescarMensajes();
        },
        (error) => {
          console.error('Error al enviar el mensaje:', error);
        }
      );
    }
  }

  private scrollBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 0);
  }

  private marcarMensajeComoAtendido(): void {
    const mensajesPaciente = (this.selectedContact.messages as any[])
      .filter((m) => m.sender === 'patient' && (m.estado === 'urgente' || m.estado === 'noleido'));

    const mensajePendiente = mensajesPaciente[mensajesPaciente.length - 1];

    if (!mensajePendiente || !mensajePendiente.id) {
      console.warn('No hay mensajes pendientes que marcar como atendidos');
      return;
    }

    const mensajeEstado = {
      mensajeId: mensajePendiente.id
    };

    this.mensajesService.marcarMensajeComoAtendido(mensajeEstado).subscribe(
      (response) => {
        console.log('Mensaje marcado como atendido:', response);
        mensajePendiente.estado = 'atendido';
      },
      (error) => {
        console.error('Error al marcar mensaje como atendido:', error);
      }
    );
  }




//filtro
searchTerm: string = '';

filteredContacts(): any[] {
  const term = this.searchTerm.toLowerCase();
  return this.contacts.filter(contact =>
    contact.name.toLowerCase().includes(term) ||
    contact.phone.toString().includes(term)
  );
}

buscarChatDesdeLocalStorage(): void {
  const telefono = localStorage.getItem('chat-telefono');

  if (telefono) {
    const telefonoLimpio = telefono.replace(/\s+/g, '');

    const chatExistente = this.contacts.find(contact =>
      contact.phone.replace(/\s+/g, '') === telefonoLimpio
    );

    if (chatExistente) {
      this.selectContact(chatExistente);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Chat no encontrado',
        text: 'No existe un chat con este paciente.',
        confirmButtonText: 'Aceptar'
      }).then(() => {
        this.deselectContact();
      });
    }

    localStorage.removeItem('chat-telefono');
  }
}


esUltimoMensajeUrgente(contact: any): boolean {
  const mensajes = contact.messages || [];
  if (mensajes.length === 0) return false;

  const ultimoMensaje = mensajes[mensajes.length - 1];
  console.log('Revisando urgencia en:', contact.phone, ultimoMensaje);

  return ultimoMensaje.sender !== 'doctor' && ultimoMensaje.estado === 'urgente';
}
esMensajeUrgenteViejo(contact: any): boolean {
  const mensajes = contact.messages || [];
  if (mensajes.length === 0) return false;

  const ultimoMensaje = mensajes[mensajes.length - 1];

  if (ultimoMensaje.sender === 'doctor' || ultimoMensaje.estado !== 'urgente') {
    return false;
  }

  const fechaMensaje = new Date(ultimoMensaje.fecha).getTime();
  const unaHora = 60 * 60 * 1000;
  const ahora = Date.now();

  return ahora - fechaMensaje > unaHora;
}
iniciarPollingMensajes(): void {
  this.intervalId = setInterval(() => {
    console.log('Polling activo...');
    this.refrescarMensajes();
  }, 10000);
}

ngOnDestroy(): void {
  clearInterval(this.intervalId);
}

}

