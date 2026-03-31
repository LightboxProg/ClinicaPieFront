import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PacientesService } from 'src/app/services/pacientes.service';
import { ListaNegraService } from 'src/app/services/lista-negra.service';
import { CitaService } from 'src/app/services/cita.service';
import { FormsModule } from '@angular/forms';
import { Cita } from 'src/app/models/worker-record.model';
import { LoginService } from 'src/app/services/login.service';
import Swal from 'sweetalert2';
import { ServicioContratadoService } from 'src/app/services/servicio-contratado.service';
import { ServiciosService } from 'src/app/services/servicios.service';
import { PromocionService, Promocion } from 'src/app/services/promocion.service';
import { AgendarCitaPerfilComponent } from '../agendar-cita-perfil/agendar-cita-perfil.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, AgendarCitaPerfilComponent],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('zoomableImg') zoomableImg!: ElementRef<HTMLImageElement>;

  showModal: boolean = false;
  paciente: any = {};
  listaNegra: any = null;
  citas: any[] = [];
  editando: boolean = false;
  esAdmin: boolean = false;
  fotosPaciente: any[] = [];
  imagenModal: string | null = null;
  subiendoImagenes: boolean = false;
  imagenSeleccionada: any = null;
  mostrarModalGaleria: boolean = false;
  indiceImagenActual: number = 0;
  promocionesDisponibles: Promocion[] = [];
  mostrarModalPromocion: boolean = false;

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
  zoomLevel = 1;


  mostrarModalEditarServicio: boolean = false;
  servicioParaEditar: any = null;
  datosEdicion: any = {
    ajusteSesiones: 0,
    nuevaFechaExpiracion: ''
  };

  constructor(
    private loginService: LoginService,
    private router: Router,
    private route: ActivatedRoute,
    private pacienteService: PacientesService,
    private listaNegraService: ListaNegraService,
    private servicioContratadoService: ServicioContratadoService,
    private serviciosService: ServiciosService,
    private promocionService: PromocionService,
    private citaService: CitaService) {
    if (!this.loginService.existeUsuario()) {
      this.router.navigate(['/login']);
    }
  }

  // Inicializa el componente cargando datos del paciente, sus citas, fotos y servicios contratados
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.pacienteService.getPacienteById(id).subscribe((res) => {
        this.paciente = res;
        this.obtenerCitasPorPaciente(id);
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

    this.cargarServiciosDisponibles();
  }

  // Cierra la ventana modal de agendamiento
  onCloseModal() {
    this.showModal = false;
  }

  // Consulta la API para obtener el listado de citas vinculadas al paciente actual
  obtenerCitasPorPaciente(id: string) {
    this.pacienteService.obtenerCitasPorPaciente(id).subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.citas = this.formatearCitas(response.data);
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  // Mapea la informacion de las citas para adaptar los datos a la vista del componente
  formatearCitas(citasData: any[]): any[] {
    return citasData.map(cita => {
      const nombreServicio = cita.servicioId?.nombre || 'Servicio no especificado';
      const sesiones = cita.servicioId?.sesiones?.numero ||
        (cita.servicioId?.tieneSesiones ? 'Por definir' : 'No aplica');

      let doctorNombre = 'Doctor no asignado';
      if (cita.servicioContratadoId?.creadoPor) {
        const doctor = cita.servicioContratadoId.creadoPor;
        doctorNombre = doctor.nombre || '';
        if (doctor.apeP) doctorNombre += ` ${doctor.apeP}`;
        if (doctor.apeM) doctorNombre += ` ${doctor.apeM}`;
        doctorNombre = doctorNombre.trim() || 'Doctor no asignado';
      }

      return {
        tratamiento: nombreServicio,
        sesiones: sesiones,
        tipoCita: cita.tipoCita || 'No especificado',
        observaciones: cita.observaciones || '',
        fecha: cita.fechaCita,
        hora: cita.horaCita || '--:--',
        ampm: cita.ampm || '',
        doctor: doctorNombre
      };
    });
  }

  // Abre la ventana modal de agendamiento
  register() {
    this.showModal = true;
  }

  // Obtiene todas las citas de manera general
  obtenerCitas() {
    this.citaService.getCita().subscribe(
      (response: Cita[]) => {
        this.citas = response;
      },
      (error) => {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al obtener las citas',
          confirmButtonText: 'Entendido'
        });
      }
    );
  }

  // Realiza el calculo matematico de la edad del paciente con base en su fecha de nacimiento
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

  // Envia el arreglo de alergias al backend para persistencia
  guardarAlergias() {
    this.pacienteService.guardarAlergias(this.paciente._id, { alergias: this.paciente.alergias }).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Exito',
          text: 'Alergias actualizadas correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron guardar las alergias',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  // Envia el texto de medicamentos al backend para persistencia
  guardarMedicamentos() {
    this.pacienteService.guardarMedicamentos(this.paciente._id, { medicamentos: this.paciente.medicamentos }).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Exito',
          text: 'Medicamentos actualizados correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron guardar los medicamentos',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  // Redirige al usuario a la vista de chat seteando el telefono del paciente en cache
  abrirChat(paciente: any) {
    localStorage.setItem('chat-telefono', paciente.telefonoWhatsapp);
    this.router.navigate(['/chats']);
  }

  // Realiza la peticion para sacar al paciente del estatus de lista negra
  eliminarDeListaNegra(): void {
    if (!this.paciente || !this.paciente._id) return;

    Swal.fire({
      title: 'Seguro?',
      text: 'Esta accion eliminara al paciente de la lista negra',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.listaNegraService.removerPacienteYActualizar(this.paciente._id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El paciente ha sido eliminado de la lista negra.', 'success');
            this.listaNegra = null;
            this.paciente.enListaNegra = false;
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo eliminar al paciente de la lista negra.', 'error');
          }
        });
      }
    });
  }

  // Cambia la variable de estado para habilitar los inputs del formulario
  activarEdicion() {
    this.editando = true;
  }

  // Valida fechas de fallecimiento y numeros telefonicos para luego guardarlos en bd
  guardarCambiosGenerales() {
    if (this.paciente.finado && !this.paciente.fechaFallecimiento) {
      this.paciente.fechaFallecimiento = new Date();
    }
    if (!this.paciente.finado) {
      this.paciente.fechaFallecimiento = null;
    }

    const telefonoWhatsapp = this.paciente.telefonoWhatsapp;
    if (telefonoWhatsapp) {
      const telefonoStr = telefonoWhatsapp.toString();
      const esMexico = telefonoStr.startsWith('52') && telefonoStr.length >= 12;

      if (esMexico) {
        const numeroLocal = telefonoStr.substring(2);
        this.paciente.telefonoPaciente = Number('52' + '1' + numeroLocal);
      } else {
        this.paciente.telefonoPaciente = Number(telefonoStr);
      }
    }

    this.pacienteService.actualizarPaciente(this.paciente._id, this.paciente).subscribe({
      next: (res) => {
        this.editando = false;
        Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'Los datos del paciente han sido actualizados correctamente.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al actualizar los datos del paciente.',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  // Elimina al paciente tras confirmar la contrasena del usuario administrador
  eliminarPaciente(): void {
    Swal.fire({
      title: `Eliminar a ${this.paciente.nombre}`,
      text: 'Esta accion eliminara al paciente y TODOS sus archivos de forma permanente.',
      icon: 'warning',
      input: 'password',
      inputLabel: 'Por favor, ingresa tu contrasena para confirmar',
      inputPlaceholder: 'Contrasena',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off',
        type: 'password'
      },
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#7066e0',
      cancelButtonColor: '#6e7881',
      preConfirm: (password) => {
        if (!password) {
          Swal.showValidationMessage('Debes ingresar tu contrasena');
          return false;
        }

        const rawUsuario = localStorage.getItem('usuarioAutenticado');
        let nombreUsuario: string | undefined;

        try {
          const usuarioAutenticado = JSON.parse(rawUsuario || '{}');
          nombreUsuario = usuarioAutenticado?.usuario?.usuario || usuarioAutenticado?.usuario;
        } catch (e) {
          console.error(e);
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

  // Trae las URLs de la galeria vinculadas a la identificacion del paciente
  cargarFotosPaciente(pacienteId: string) {
    this.pacienteService.obtenerFotosDelPaciente(pacienteId).subscribe({
      next: (res) => {
        this.fotosPaciente = res.fotos || [];
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  // Ejecuta un clic simulado en el input de tipo archivo
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  // Recibe la informacion del archivo subido e inicia el proceso de guardado iterativo
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);

    files.forEach((file: File) => {
      this.subirImagen(file);
    });

    this.fileInput.nativeElement.value = '';
  }

  // Construye un formulario de datos y ejecuta la peticion HTTP de carga de imagen
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
        this.cargarFotosPaciente(this.paciente._id);
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo subir la imagen', 'error');
      },
      complete: () => {
        this.subiendoImagenes = false;
      }
    });
  }

  // Configura evento de la rueda del raton para la manipulacion del zoom
  ngAfterViewInit() {
    if (this.zoomableImg) {
      this.zoomableImg.nativeElement.addEventListener('wheel', (event: WheelEvent) => {
        event.preventDefault();
        if (event.deltaY < 0) {
          this.zoomLevel = Math.min(this.zoomLevel + 0.1, 5);
        } else {
          this.zoomLevel = Math.max(this.zoomLevel - 0.1, 1);
        }
        this.zoomableImg.nativeElement.style.transform = `scale(${this.zoomLevel})`;
      });
    }
  }

  // Despliega el visualizador y marca la imagen actual como activa
  abrirModalImagen(foto: any, index: number) {
    this.imagenSeleccionada = foto;
    this.indiceImagenActual = index;
    this.mostrarModalGaleria = true;
  }

  // Resta una posicion al puntero del indice para visualizar imagen previa
  imagenAnterior() {
    if (this.fotosPaciente.length > 0) {
      this.indiceImagenActual = (this.indiceImagenActual - 1 + this.fotosPaciente.length) % this.fotosPaciente.length;
      this.imagenSeleccionada = this.fotosPaciente[this.indiceImagenActual];
    }
  }

  // Suma una posicion al puntero del indice para visualizar imagen siguiente
  imagenSiguiente() {
    if (this.fotosPaciente.length > 0) {
      this.indiceImagenActual = (this.indiceImagenActual + 1) % this.fotosPaciente.length;
      this.imagenSeleccionada = this.fotosPaciente[this.indiceImagenActual];
    }
  }

  // Vacia las variables de galeria y oculta el visualizador
  cerrarModalGaleria() {
    this.mostrarModalGaleria = false;
    this.imagenSeleccionada = null;
    this.indiceImagenActual = 0;
  }

  // Genera objeto tipo blob temporal e inicializa su descarga
  descargarImagen() {
    if (!this.imagenSeleccionada) return;

    const fotoId = this.imagenSeleccionada._id || this.imagenSeleccionada.id;
    const nombreArchivo = this.obtenerNombreArchivo();

    this.pacienteService.descargarImagen(this.paciente._id, fotoId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = nombreArchivo;

        document.body.appendChild(enlace);
        enlace.click();

        setTimeout(() => {
          document.body.removeChild(enlace);
          window.URL.revokeObjectURL(url);
        }, 100);

        this.cerrarModalGaleria();
        Swal.close();
        Swal.fire('Descarga completa', '', 'success');
      },
      error: (error) => {
        console.error(error);
        Swal.close();
        Swal.fire('Error', 'No se pudo descargar', 'error');
      }
    });
  }

  // Evalua los parametros de la imagen actual para conformar su nombre de salida
  obtenerNombreArchivo(): string {
    if (this.imagenSeleccionada?.nombre) {
      return this.imagenSeleccionada.nombre;
    }

    const url = this.imagenSeleccionada?.url;
    if (url) {
      const partes = url.split('/');
      let nombreArchivo = partes[partes.length - 1];

      nombreArchivo = nombreArchivo.split('?')[0];

      if (!nombreArchivo.includes('.')) {
        nombreArchivo += '.jpg';
      }
      return nombreArchivo;
    }
    return `imagen_paciente_${Date.now()}.jpg`;
  }

  // Muestra ventana de precaucion para confirmar el deseo de borrar el recurso
  eliminarImagen() {
    if (!this.imagenSeleccionada) return;

    const fotoId = this.imagenSeleccionada._id || this.imagenSeleccionada.id;

    this.cerrarModalGaleria();
    Swal.fire({
      title: 'Eliminar imagen?',
      text: 'Esta accion no se puede deshacer. La imagen se eliminara permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#7066e0',
      cancelButtonColor: '#6e7881',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.confirmarEliminarImagen(fotoId);
      }
    });
  }

  // Contacta al API ejecutando la peticion destructiva final sobre la imagen
  confirmarEliminarImagen(fotoId: string) {
    if (!this.paciente?._id) return;

    Swal.fire({
      title: 'Eliminando...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.pacienteService.eliminarImagenAlbum(this.paciente._id, fotoId).subscribe({
      next: (response) => {
        this.cerrarModalGaleria();
        this.cargarFotosPaciente(this.paciente._id);
        Swal.fire({
          title: 'Eliminada',
          text: 'La imagen se elimino correctamente',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error(error);
        Swal.fire({
          title: 'Error',
          text: error.error?.error || 'No se pudo eliminar la imagen',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  // Asigna formato JSON a cada elemento de la consulta a base de datos
  cargarServiciosContratados() {
    if (this.paciente?._id) {
      this.servicioContratadoService.obtenerServiciosPorPaciente(this.paciente._id)
        .subscribe({
          next: (res) => {
            this.serviciosContratados = (res.data || []).map((servicio: any) => {
              servicio.mostrarObservaciones = false;

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
            console.error(err);
          }
        });
    }
  }

  // Lista elementos con sesiones validas
  cargarServiciosDisponibles() {
    this.serviciosService.obtenerServicios('', 'true')
      .subscribe({
        next: (res) => {
          this.serviciosDisponibles = res.data.filter((servicio: any) => servicio.tieneSesiones);
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  // Establece parametros inicales del modal para nuevo servicio
  abrirModalContratarServicio() {
    this.mostrarModalServicio = true;
    this.cargarServiciosDisponibles();

    const hoy = new Date();
    const fechaExp = new Date(hoy.setMonth(hoy.getMonth() + 4));
    this.nuevoServicio.fechaExpiracion = fechaExp.toISOString().split('T')[0];
  }

  // Manda informacion del formulario finalizada hacia api de servicios
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
          Swal.fire('Exito', 'Servicio contratado correctamente', 'success');
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

  // Descuenta del inventario una sesion y anexa informacion de seguimiento
  usarSesion(servicioContratado: any) {
    Swal.fire({
      title: 'Usar una sesion?',
      text: `Deseas usar una sesion de ${servicioContratado.servicio.nombre}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Si, usar sesion',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Observaciones de la sesion',
          input: 'textarea',
          inputLabel: 'Observaciones (opcional)',
          inputPlaceholder: 'Describe el procedimiento, observaciones, recomendaciones...',
          showCancelButton: true,
          inputValidator: (value) => {
            return null;
          }
        }).then((observacionResult) => {
          if (observacionResult.isConfirmed) {
            const observacionData = {
              texto: observacionResult.value || 'Sesion utilizada sin observaciones',
              fecha: new Date(),
              hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
              autor: 'Usuario actual'
            };

            this.servicioContratadoService.usarSesion(
              servicioContratado._id,
              observacionData.texto
            ).subscribe({
              next: (res) => {
                Swal.fire('Exito', 'Sesion utilizada correctamente', 'success');

                if (!Array.isArray(servicioContratado.observaciones)) {
                  servicioContratado.observaciones = [];
                }

                servicioContratado.observaciones.unshift(observacionData);

                servicioContratado.sesionesUsadas++;
                servicioContratado.sesionesRestantes--;

                servicioContratado.mostrarObservaciones = true;

                this.cargarServiciosContratados();
              },
              error: (err) => {
                Swal.fire('Error', err.error?.message || 'No se pudo usar la sesion', 'error');
              }
            });
          }
        });
      }
    });
  }

  // Permite agregar turnos a paciente para determinado registro de servicio
  abrirModalAgregarSesiones(servicio: any) {
    this.servicioParaAgregarSesiones = servicio;
    this.nuevasSesiones = { cantidad: 1, motivo: '' };
    this.mostrarModalAgregarSesiones = true;
  }

  // Ejecuta actualizacion de sumatoria sobre servicio del cliente
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
        Swal.fire('Exito', `${this.nuevasSesiones.cantidad} sesiones agregadas`, 'success');
        this.mostrarModalAgregarSesiones = false;
        this.cargarServiciosContratados();
      },
      error: (err) => {
        Swal.fire('Error', 'No se pudieron agregar las sesiones', 'error');
      }
    });
  }

  // Limpia visual y logica de formulario en servicio
  resetearFormularioServicio() {
    this.nuevoServicio = {
      servicioId: '',
      sesionesTotales: 1,
      fechaExpiracion: '',
      observaciones: ''
    };
  }

  // Activa despliegue general de comentarios en seccion html
  toggleObservaciones(servicio: any): void {
    servicio.mostrarObservaciones = !servicio.mostrarObservaciones;
  }

  // Forma bloques visuales separando logs dependiente a cada fecha unica 
  getObservationsGroupedByDate(observaciones: any[]): any[] {
    if (!observaciones || !Array.isArray(observaciones)) {
      return [];
    }

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

    return Object.values(groups)
      .map((group: any) => ({
        ...group,
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

  // Auxiliar numerico que asiste proceso en ordenacion por horas
  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Valida y modifica strings a formato 24 horas 
  formatTime(time: string): string {
    if (!time) return '--:--';

    if (time.includes(':')) {
      const [hours, minutes] = time.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }

    return time;
  }

  // Metodo booleano verificador 
  isObservacionesArray(observaciones: any): boolean {
    return Array.isArray(observaciones) && observaciones.length > 0;
  }

  // Inicializa seccion general interactiva para agregar beneficios promocionales
  abrirModalContratarPromocion() {
    this.cargarPromocionesDisponibles();
    this.mostrarModalPromocion = true;
  }

  // Restringe busqueda para ignorar beneficios unitarios
  cargarPromocionesDisponibles() {
    // Si los servicios aún no se han cargado, los cargamos ahora
    if (this.serviciosDisponibles.length === 0) {
      this.serviciosService.obtenerServicios('', 'true').subscribe({
        next: (res) => {
          this.serviciosDisponibles = res.data.filter((servicio: any) => servicio.tieneSesiones);
          this.procesarPromociones(); // una vez cargados, procesamos promociones
        },
        error: (err) => {
          console.error(err);
          Swal.fire('Error', 'No se pudieron cargar los servicios', 'error');
        }
      });
    } else {
      this.procesarPromociones();
    }
  }

  procesarPromociones() {
    this.promocionService.obtenerPromociones({ activa: true, vigente: true }).subscribe({
      next: (res: any) => {
        let promociones = res.data.filter((p: Promocion) =>
          p.tipoAnclaje === 'servicio' &&
          p.servicios &&
          p.servicios.length > 0
        );

        // Enriquecer cada promoción con los nombres de los servicios
        promociones = promociones.map((promo: Promocion) => {
          // Si promo.servicios existe, lo mapeamos; si no, array vacío
          const serviciosEnriquecidos = promo.servicios?.map((item: any) => {
            // Buscar el servicio completo en la lista local usando item.servicio (ID)
            const servicioCompleto = this.serviciosDisponibles.find(s => s._id === item.servicio);
            return {
              ...item,
              servicio: servicioCompleto ? servicioCompleto : { nombre: 'Servicio desconocido' }
            };
          }) || [];

          return { ...promo, servicios: serviciosEnriquecidos };
        });

        this.promocionesDisponibles = promociones;
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire('Error', 'No se pudieron cargar las promociones', 'error');
      }
    });
  }
  
  contratarPromocion(promocion: Promocion) {
    // 1. Cerrar el modal de promociones
    this.mostrarModalPromocion = false;

    // 2. Mostrar confirmación
    Swal.fire({
      title: 'Confirmar contratación',
      html: `Deseas contratar la promoción <strong>${promocion.nombre}</strong>?<br>
           Se agregarán las sesiones correspondientes a los servicios incluidos.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, contratar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        // 3. Realizar la contratación
        const payload = {
          pacienteId: this.paciente._id,
          sucursalId: null
        };
        this.promocionService.contratarPromocion(promocion._id!, payload).subscribe({
          next: (res: any) => {
            Swal.fire('Éxito', 'Promoción contratada correctamente', 'success');
            this.cargarServiciosContratados();
          },
          error: (err: any) => {
            console.error(err);
            Swal.fire('Error', err.error?.message || 'No se pudo contratar la promoción', 'error');
          }
        });
      }
      // Si cancela, no hacemos nada, el modal ya está cerrado.
    });
  }

  // Realiza purga individual del servicio seleccionado
  eliminarServicioContratado(servicio: any) {
    Swal.fire({
      title: 'Eliminar servicio?',
      text: `Estas seguro de eliminar "${servicio.servicio?.nombre}"? Esta accion no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.servicioContratadoService.eliminarServicioContratado(servicio._id).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El servicio ha sido eliminado.', 'success');
            this.cargarServiciosContratados();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo eliminar el servicio.', 'error');
          }
        });
      }
    });
  }

  // Itera coleccion y ejecuta purga de listado de servicios vinculados
  eliminarTodosServiciosContratados() {
    Swal.fire({
      title: 'Eliminar todos los servicios?',
      text: `Esta accion eliminara TODOS los servicios contratados de ${this.paciente.nombre}. No se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Si, eliminar todos',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.servicioContratadoService.eliminarTodosServicios(this.paciente._id).subscribe({
          next: (res) => {
            Swal.fire('Eliminados', `Se eliminaron ${res.deletedCount} servicios.`, 'success');
            this.cargarServiciosContratados();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudieron eliminar los servicios.', 'error');
          }
        });
      }
    });
  }

  // Abre el modal de edición con los datos actuales del servicio
  abrirModalEditarServicio(servicio: any) {
    this.servicioParaEditar = servicio;
    this.datosEdicion = {
      ajusteSesiones: 0,
      nuevaFechaExpiracion: ''
    };
    this.mostrarModalEditarServicio = true;
  }

  // Guarda los cambios: ajusta sesiones y actualiza fecha de expiración
  guardarEdicionServicio() {
    const ajuste = this.datosEdicion.ajusteSesiones;
    if (ajuste === 0 && !this.datosEdicion.nuevaFechaExpiracion) {
      Swal.fire('Sin cambios', 'No se realizó ningún ajuste.', 'info');
      this.mostrarModalEditarServicio = false;
      return;
    }

    const payload: any = {};
    if (ajuste !== 0) payload.ajusteSesiones = ajuste;
    if (this.datosEdicion.nuevaFechaExpiracion) payload.fechaExpiracion = this.datosEdicion.nuevaFechaExpiracion;

    Swal.fire({
      title: 'Guardando cambios...',
      text: 'Por favor espere',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.servicioContratadoService.ajustarServicio(this.servicioParaEditar._id, payload).subscribe({
      next: (res) => {
        Swal.close();
        Swal.fire('Éxito', 'Servicio actualizado correctamente', 'success');
        this.mostrarModalEditarServicio = false;
        this.cargarServiciosContratados();
      },
      error: (err) => {
        Swal.close();
        const msg = err.error?.message || 'Error al actualizar el servicio';
        Swal.fire('Error', msg, 'error');
      }
    });
  }
}