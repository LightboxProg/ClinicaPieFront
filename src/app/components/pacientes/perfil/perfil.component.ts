import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalComponent } from '../../modal/modal.component';
import { PacientesService } from 'src/app/services/pacientes.service';
import { ListaNegraService } from 'src/app/services/lista-negra.service';
import { CitaService } from 'src/app/services/cita.service';
import { FormsModule } from '@angular/forms';
import { Cita } from 'src/app/models/worker-record.model';
import { LoginService } from 'src/app/services/login.service';
import { ViewChild, ElementRef } from '@angular/core';
import Swal from 'sweetalert2';
import { ServicioContratadoService } from 'src/app/services/servicio-contratado.service';
import { ServiciosService } from 'src/app/services/servicios.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, ModalComponent, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('zoomableImg') zoomableImg!: ElementRef<HTMLImageElement>;
  showModal: boolean = false;
  paciente: any = {};
  tratamiento: string = '';
  observaciones: string = '';
  realizo: string = '';
  pago: number = 0;
  horaInicio: string = '';
  horaFin: string = '';
  fechaCita: Date = new Date();
  listaNegra: any = null;
  citas: Cita[] = []; // Arreglo para almacenar las citas
  editando: boolean = false;
  esAdmin: boolean = false;
  fotosPaciente: any[] = [];
  imagenModal: string | null = null;
  subiendoImagenes: boolean = false;
  imagenSeleccionada: any = null;
  mostrarModalGaleria: boolean = false;
  indiceImagenActual: number = 0;

  serviciosContratados: any[] = [];
  serviciosDisponibles: any[] = [];
  mostrarModalServicio: boolean = false;
  mostrarModalAgregarSesiones: boolean = false;
  servicioSeleccionado: any = null;
  servicioParaAgregarSesiones: any = null;
  nuevoServicio: any = {
    servicioId: '',
    sesionesTotales: 1,
    fechaExpiracion: '',
    observaciones: ''
  };
  nuevasSesiones: any = {
    cantidad: 1,
    motivo: ''
  };


  onCloseModal() {
    this.showModal = false;
  }

  constructor(
    private loginService: LoginService,
    private router: Router,
    private route: ActivatedRoute,
    private pacienteService: PacientesService,
    private listaNegraService: ListaNegraService,
    private servicioContratadoService: ServicioContratadoService,
    private serviciosService: ServiciosService,
    private citaService: CitaService) {
    if (!this.loginService.existeUsuario()) {
      // Si no está autenticado, redirigir al login
      this.router.navigate(['/login']);
    }
  }


  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pacienteService.getPacienteById(id).subscribe((res) => {
        this.paciente = res;
        this.obtenerCitasPorPaciente(id); // Filtrar citas por paciente
        this.cargarFotosPaciente(id);
        this.cargarServiciosContratados();
        this.listaNegraService.getDatosListaNegraPorPaciente(id).subscribe((res) => {
          if (res.enListaNegra) {
            this.listaNegra = res.datos;
          }
        });
      });
    }
    const usuario = JSON.parse(localStorage.getItem('usuarioAutenticado') || '{}');
    this.esAdmin = usuario?.tipo === 'Administrador';
  }

  obtenerCitasPorPaciente(id: string) {
    this.citaService.getCitasPorPaciente(id).subscribe(
      (response: Cita[]) => {
        this.citas = response;
      },
      (error) => {
        console.error('Error al obtener citas del paciente:', error);
      }
    );
  }

  register() {
    this.showModal = true;
  }

  nuevaCita() {
    const nuevaCita = {
      pacienteId: this.paciente._id,  // Se añade el pacienteId desde el objeto paciente cargado
      tratamiento: this.tratamiento,
      observaciones: this.observaciones || '',
      realizo: this.realizo || '',
      pago: this.pago || 0,
      horaInicio: this.horaInicio || '',
      horaFin: this.horaFin || '',
      fechaCita: this.fechaCita || ''
      ,
      fecha: new Date()

    };

    this.citaService.addCita(nuevaCita).subscribe(
      (response) => {
        console.log('Cita creada:', response);
        Swal.fire({
          icon: 'success',
          title: '¡Cita creada!',
          text: 'La cita se creó correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
        this.obtenerCitasPorPaciente(this.paciente._id); // Actualizar la lista de citas
      },
      (error: any) => {
        console.error('Error al crear la cita:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear la cita. Por favor, inténtalo de nuevo.',
          confirmButtonText: 'Entendido'
        });
      }
    );
  }


  obtenerCitas() {
    this.citaService.getCita().subscribe(
      (response: Cita[]) => {
        this.citas = response; // Guardar las citas obtenidas
        console.log('Citas:', this.citas); // Solo para depuración
      },
      (error) => {
        console.error('Error al obtener las citas:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al obtener las citas',
          confirmButtonText: 'Entendido'
        });
      }
    );
  }
  calcularEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 0;

    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();

    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  }

  guardarAlergias() {
    this.pacienteService.guardarAlergias(this.paciente._id, { alergias: this.paciente.alergias }).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Alergias actualizadas correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al guardar alergias:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron guardar las alergias',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  guardarMedicamentos() {
    this.pacienteService.guardarMedicamentos(this.paciente._id, { medicamentos: this.paciente.medicamentos }).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Medicamentos actualizados correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al guardar medicamentos:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron guardar los medicamentos',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  abrirChat(paciente: any) {
    localStorage.setItem('chat-telefono', paciente.telefonoWhatsapp);
    this.router.navigate(['/chats']);
  }

  eliminarDeListaNegra(): void {
    if (!this.paciente || !this.paciente._id) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará al paciente de la lista negra',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.listaNegraService.removerPacienteYActualizar(this.paciente._id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El paciente ha sido eliminado de la lista negra.', 'success');
            this.listaNegra = null;
            this.paciente.enListaNegra = false;
          },
          error: (err) => {
            console.error('Error al eliminar de lista negra:', err);
            Swal.fire('Error', 'No se pudo eliminar al paciente de la lista negra.', 'error');
          }
        });
      }
    });
  }


  activarEdicion() {
    this.editando = true;
  }

  guardarCambiosGenerales() {
    // Si se marca como finado y no hay fecha de fallecimiento, asigna la fecha actual
    if (this.paciente.finado && !this.paciente.fechaFallecimiento) {
      this.paciente.fechaFallecimiento = new Date();
    }

    // Si se desmarca como finado, limpia la fecha de fallecimiento
    if (!this.paciente.finado) {
      this.paciente.fechaFallecimiento = null;
    }

    // --- Sincronización de teléfonos ---
    const telefonoWhatsapp = this.paciente.telefonoWhatsapp;
    if (telefonoWhatsapp) {
      // Convertir a string por si es número
      const telefonoStr = telefonoWhatsapp.toString();

      // Determinar si es México: asumimos que el código de país son los primeros 2 dígitos (52)
      const esMexico = telefonoStr.startsWith('52') && telefonoStr.length >= 12; // 52 + 10 dígitos

      if (esMexico) {
        // Extraer el número local (después del código 52)
        const numeroLocal = telefonoStr.substring(2); // deberían ser 10 dígitos
        // Construir telefonoPaciente: 52 + 1 + numeroLocal
        this.paciente.telefonoPaciente = Number('52' + '1' + numeroLocal);
      } else {
        // Para otros países, ambos números son iguales
        this.paciente.telefonoPaciente = Number(telefonoStr);
      }
    }

    this.pacienteService.actualizarPaciente(this.paciente._id, this.paciente).subscribe({
      next: (res) => {
        this.editando = false;
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Los datos del paciente han sido actualizados correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al actualizar paciente:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al actualizar los datos del paciente.',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }


  eliminarPaciente(): void {
    Swal.fire({
      title: `Eliminar a ${this.paciente.nombre}`,
      input: 'password',
      inputLabel: 'Por favor, ingresa tu contraseña para confirmar',
      inputPlaceholder: 'Contraseña',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off',
        type: 'password'
      },
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      preConfirm: (password) => {
        if (!password) {
          Swal.showValidationMessage('Debes ingresar tu contraseña');
          return false;
        }

        const rawUsuario = localStorage.getItem('usuarioAutenticado');
        let nombreUsuario: string | undefined;

        try {
          const usuarioAutenticado = JSON.parse(rawUsuario || '{}');
          nombreUsuario = usuarioAutenticado?.usuario?.usuario || usuarioAutenticado?.usuario;
        } catch (e) {
          console.error('Error al parsear usuarioAutenticado:', e);
        }

        if (!nombreUsuario || typeof nombreUsuario !== 'string') {
          Swal.showValidationMessage('No se pudo obtener el usuario autenticado.');
          return false;
        }

        return this.pacienteService
          .eliminarPacienteConContrasena(nombreUsuario, password, this.paciente._id)
          .toPromise()
          .then(() => {
            Swal.fire('Eliminado', `Paciente ${this.paciente.nombre} eliminado correctamente.`, 'success');
            this.router.navigate(['/lista-pacientes']);
          })
          .catch((error) => {
            Swal.showValidationMessage(error.error?.message || 'Error al eliminar el paciente');
          });
      }
    });
  }

  cargarFotosPaciente(pacienteId: string) {
    this.pacienteService.obtenerFotosDelPaciente(pacienteId).subscribe({
      next: (res) => {
        this.fotosPaciente = res.fotos || [];
      },
      error: (err) => {
        console.error('Error al cargar fotos del paciente:', err);
      }
    });
  }


  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);

    files.forEach((file: File) => {
      this.subirImagen(file);
    });

    this.fileInput.nativeElement.value = '';
  }

  subirImagen(file: File) {
    if (!this.paciente || !this.paciente._id) {
      Swal.fire('Error', 'Paciente no seleccionado', 'error');
      return;
    }

    this.subiendoImagenes = true;

    const formData = new FormData();
    formData.append('file', file);

    this.pacienteService.subirImagenAlbum(this.paciente._id, formData).subscribe({
      next: () => {
        this.cargarFotosPaciente(this.paciente._id); // refresca galería
      },
      error: (err) => {
        console.error('Error al subir imagen:', err);
        Swal.fire('Error', 'No se pudo subir la imagen', 'error');
      },
      complete: () => {
        this.subiendoImagenes = false;
      }
    });
  }



  cerrarModalImagen() {
    this.imagenModal = null;
  }

  zoomLevel = 1;

  ngAfterViewInit() {
    if (this.zoomableImg) {
      this.zoomableImg.nativeElement.addEventListener('wheel', (event: WheelEvent) => {
        event.preventDefault();
        if (event.deltaY < 0) {
          // Scroll arriba: aumentar zoomabrirModalImagen
          this.zoomLevel = Math.min(this.zoomLevel + 0.1, 5);
        } else {
          // Scroll abajo: disminuir zoom
          this.zoomLevel = Math.max(this.zoomLevel - 0.1, 1);
        }
        this.zoomableImg.nativeElement.style.transform = `scale(${this.zoomLevel})`;
      });
    }
  }

  abrirModalImagen(foto: any, index: number) {
    this.imagenSeleccionada = foto;
    this.indiceImagenActual = index;
    this.mostrarModalGaleria = true;
  }

  imagenAnterior() {
    if (this.fotosPaciente.length > 0) {
      this.indiceImagenActual = (this.indiceImagenActual - 1 + this.fotosPaciente.length) % this.fotosPaciente.length;
      this.imagenSeleccionada = this.fotosPaciente[this.indiceImagenActual];
    }
  }

  imagenSiguiente() {
    if (this.fotosPaciente.length > 0) {
      this.indiceImagenActual = (this.indiceImagenActual + 1) % this.fotosPaciente.length;
      this.imagenSeleccionada = this.fotosPaciente[this.indiceImagenActual];
    }
  }

  cerrarModalGaleria() {
    this.mostrarModalGaleria = false;
    this.imagenSeleccionada = null;
    this.indiceImagenActual = 0;
  }


  // Métodos para servicios contratados
  cargarServiciosContratados() {
    if (this.paciente?._id) {
      this.servicioContratadoService.obtenerServiciosPorPaciente(this.paciente._id)
        .subscribe({
          next: (res) => {
            this.serviciosContratados = (res.data || []).map((servicio: any) => {
              // Inicializar propiedad para el acordeón
              servicio.mostrarObservaciones = false;

              // Si observaciones es un string, convertirlo a array
              if (servicio.observaciones && typeof servicio.observaciones === 'string') {
                servicio.observaciones = [{
                  texto: servicio.observaciones,
                  fecha: servicio.fechaContratacion || new Date(),
                  hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
                  autor: 'Sistema'
                }];
              }

              return servicio;
            });
          },
          error: (err) => {
            console.error('Error al cargar servicios contratados:', err);
          }
        });
    }
  }

  cargarServiciosDisponibles() {
    this.serviciosService.obtenerServicios('', 'true')
      .subscribe({
        next: (res) => {
          // Filtrar solo servicios con múltiples sesiones
          this.serviciosDisponibles = res.data.filter((servicio: any) => servicio.tieneSesiones);
        },
        error: (err) => {
          console.error('Error al cargar servicios:', err);
        }
      });
  }

  abrirModalContratarServicio() {
    this.mostrarModalServicio = true;
    this.cargarServiciosDisponibles();
  }

  contratarServicio() {
    if (!this.nuevoServicio.servicioId) {
      Swal.fire('Error', 'Selecciona un servicio', 'error');
      return;
    }

    const servicioData = {
      pacienteId: this.paciente._id,
      servicioId: this.nuevoServicio.servicioId,
      sesionesTotales: this.nuevoServicio.sesionesTotales,
      fechaExpiracion: this.nuevoServicio.fechaExpiracion,
      observaciones: this.nuevoServicio.observaciones
    };

    this.servicioContratadoService.contratarServicio(servicioData)
      .subscribe({
        next: (res) => {
          Swal.fire('¡Éxito!', 'Servicio contratado correctamente', 'success');
          this.mostrarModalServicio = false;
          this.cargarServiciosContratados();
          this.resetearFormularioServicio();
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudo contratar el servicio', 'error');
          console.error(err);
        }
      });
  }

  usarSesion(servicioContratado: any) {
    Swal.fire({
      title: '¿Usar una sesión?',
      text: `¿Deseas usar una sesión de ${servicioContratado.servicio.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, usar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Observaciones de la sesión',
          input: 'textarea',
          inputLabel: 'Observaciones (opcional)',
          inputPlaceholder: 'Describe el procedimiento, observaciones, recomendaciones...',
          showCancelButton: true,
          inputValidator: (value) => {
            // Puedes agregar validaciones aquí si es necesario
            return null;
          }
        }).then((observacionResult) => {
          if (observacionResult.isConfirmed) {
            const observacionData = {
              texto: observacionResult.value || 'Sesión utilizada sin observaciones',
              fecha: new Date(),
              hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
              autor: 'Usuario actual' // Puedes obtener el usuario actual del servicio de autenticación
            };

            this.servicioContratadoService.usarSesion(
              servicioContratado._id,
              observacionData.texto
            ).subscribe({
              next: (res) => {
                Swal.fire('¡Éxito!', 'Sesión utilizada correctamente', 'success');

                // Agregar la observación al array local
                if (!Array.isArray(servicioContratado.observaciones)) {
                  servicioContratado.observaciones = [];
                }

                servicioContratado.observaciones.unshift(observacionData);

                // Actualizar contadores
                servicioContratado.sesionesUsadas++;
                servicioContratado.sesionesRestantes--;

                // Abrir automáticamente las observaciones
                servicioContratado.mostrarObservaciones = true;

                // Actualizar la lista completa (opcional)
                this.cargarServiciosContratados();
              },
              error: (err) => {
                Swal.fire('Error', err.error?.message || 'No se pudo usar la sesión', 'error');
              }
            });
          }
        });
      }
    });
  }

  abrirModalAgregarSesiones(servicio: any) {
    this.servicioParaAgregarSesiones = servicio;
    this.nuevasSesiones = { cantidad: 1, motivo: '' };
    this.mostrarModalAgregarSesiones = true;
  }

  agregarSesiones() {
    if (this.nuevasSesiones.cantidad <= 0) {
      Swal.fire('Error', 'La cantidad debe ser mayor a 0', 'error');
      return;
    }

    this.servicioContratadoService.agregarSesiones(
      this.servicioParaAgregarSesiones._id,
      this.nuevasSesiones.cantidad,
      this.nuevasSesiones.motivo
    ).subscribe({
      next: (res) => {
        Swal.fire('¡Éxito!', `${this.nuevasSesiones.cantidad} sesiones agregadas`, 'success');
        this.mostrarModalAgregarSesiones = false;
        this.cargarServiciosContratados();
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudieron agregar las sesiones', 'error');
      }
    });
  }

  resetearFormularioServicio() {
    this.nuevoServicio = {
      servicioId: '',
      sesionesTotales: 1,
      fechaExpiracion: '',
      observaciones: ''
    };
  }

  toggleObservaciones(servicio: any): void {
    servicio.mostrarObservaciones = !servicio.mostrarObservaciones;
  }


  getObservationsGroupedByDate(observaciones: any[]): any[] {
    if (!observaciones || !Array.isArray(observaciones)) {
      return [];
    }

    // Si las observaciones son strings, convertirlas a objetos
    const processedObs = observaciones.map((obs, index) => {
      if (typeof obs === 'string') {
        return {
          texto: obs,
          fecha: new Date(),
          hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
          autor: 'Sistema'
        };
      }
      return obs;
    });

    // Agrupar por fecha (sin hora)
    const groups: any = {};

    processedObs.forEach(obs => {
      const fechaKey = obs.fecha ? new Date(obs.fecha).toISOString().split('T')[0] : 'sin-fecha';

      if (!groups[fechaKey]) {
        groups[fechaKey] = {
          fecha: obs.fecha || new Date(),
          observaciones: []
        };
      }

      groups[fechaKey].observaciones.push(obs);
    });

    // Convertir a array y ordenar por fecha (más reciente primero)
    return Object.values(groups)
      .map((group: any) => ({
        ...group,
        // Ordenar observaciones dentro del grupo por hora (más reciente primero)
        observaciones: group.observaciones.sort((a: any, b: any) => {
          const timeA = a.hora ? this.timeToMinutes(a.hora) : 0;
          const timeB = b.hora ? this.timeToMinutes(b.hora) : 0;
          return timeB - timeA;
        })
      }))
      .sort((a: any, b: any) => {
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      });
  }

  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  formatTime(time: string): string {
    if (!time) return '--:--';

    // Si ya está en formato 24h
    if (time.includes(':')) {
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    return time;
  }

  isObservacionesArray(observaciones: any): boolean {
    return Array.isArray(observaciones) && observaciones.length > 0;
  }

}




