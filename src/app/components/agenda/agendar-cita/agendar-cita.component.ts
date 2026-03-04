import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarService } from 'src/app/services/calendar.service';
import { PacientesService } from 'src/app/services/pacientes.service';
import { SwalService } from 'src/app/services/swal.service';
import Swal from 'sweetalert2';
import * as moment from 'moment';
import { ServicioContratadoService } from 'src/app/services/servicio-contratado.service';
import { ServiciosService } from 'src/app/services/servicios.service';
import { FormsModule } from '@angular/forms';

interface DetallesCita {
  pacienteNombre: string;
  pacienteTelefono: string;
  tipoCita: string;
  fechaHora: string;
  duracion: number;
  observaciones: string;
  servicioContratado: any;
  servicioIndividual: boolean;
  enlaceGoogleCalendar: string;
  esPasada?: boolean;
}

interface DetallesBloqueo {
  fechaFormateada: string;
  horaInicio: string;
  horaFin: string;
  duracionHoras: string;
  duracionMinutos: number;
  tipo: string;
  motivo: string;
}

interface EventoAgenda {
  tipo: string;
  subtipo?: string;
  descripcion?: string;
  detalles?: string;
  color?: string;
  eventoId?: string;
  _id?: string;
  esPrimerBloque?: boolean;
  esMismoEventoQueAnterior?: boolean;
  eventoAgrupadoId?: string;
}

interface Horario {
  hora: string;
  disponible: boolean;
  eventos: EventoAgenda[];
  esCitaExistente: boolean;
  esBloqueo?: boolean;
  esBloqueoPersonal?: boolean;
  esBloqueoGeneral?: boolean;
  esPasado?: boolean;
  esPrimerBloqueEvento?: boolean;
  textoMostrar?: string;
}

interface DiaSemana {
  fecha: string;
  nombre: string;
  fechaFormateada: string;
  horarios: Horario[];
  esPasadoDia?: boolean;
}

interface SlotAgenda {
  tipo: string;
  subtipo?: string;
  descripcion?: string;
  hora_inicio: string;
  hora_fin: string;
  color?: string;
  eventoId?: string;
}

interface DiaAgenda {
  fecha: string;
  agenda: SlotAgenda[];
}

interface PacienteBuscado {
  id: string;
  nombre: string;
  telefonoWhatsapp?: number;
  telefonoPaciente?: number;
}

interface ServicioContratado {
  _id: string;
  servicio: {
    nombre: string;
    duracion: number;
  };
  sesionesRestantes: number;
  estado: string;
  fechaExpiracion?: Date;
}

interface ServicioIndividual {
  _id: string;
  nombre: string;
  duracion: number;
  costo: number;
  descripcionCorta: string;
  categoria: {
    _id: string;
    nombre: string;
  };
}

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendar-cita.component.html',
  styleUrls: ['./agendar-cita.component.scss']
})
export class AgendarCitaComponent {
  weeks: DiaSemana[][] = [];
  currentWeekStart: moment.Moment;
  cargando = false;
  horasDelDia: string[] = [];

  // Variables para selección
  pacienteSeleccionado: PacienteBuscado | null = null;

  // Servicios contratados del paciente
  serviciosContratados: ServicioContratado[] = [];
  serviciosIndividuales: ServicioIndividual[] = [];

  usarServicioContratado: boolean = false;
  servicioContratadoSeleccionado: string = '';
  servicioIndividualSeleccionado: string = '';
  observaciones: string = '';

  // Búsqueda de paciente
  pacientes: PacienteBuscado[] = [];
  pacientesFiltrados: PacienteBuscado[] = [];

  modoBloqueo: boolean = false;
  seleccionandoBloqueo: boolean = false;
  bloqueoInicio: { fecha: string, hora: string } | null = null;
  bloqueoFin: { fecha: string, hora: string } | null = null;
  slotsSeleccionados: string[] = [];
  serviciosFiltrados: ServicioIndividual[] = [];

  mostrarModalCita = false;
  modalFecha = '';
  modalHoraInicio = '';
  modalHoraFin = '';
  busquedaPaciente = '';
  busquedaServicio = '';

  mostrarModalDetallesCita = false;
  mostrarModalCancelarCita = false;
  mostrarModalConfirmarBloqueo = false;
  mostrarModalEliminarBloqueo = false;

  detallesCitaSeleccionada: DetallesCita | null = null;
  motivoCancelacion = '';
  detallesBloqueo: DetallesBloqueo = {
    fechaFormateada: '',
    horaInicio: '',
    horaFin: '',
    duracionHoras: '',
    duracionMinutos: 0,
    tipo: 'personal',
    motivo: ''
  };

  eventoBloqueoSeleccionado: any = null;
  motivoEliminacionBloqueo = '';
  citaParaCancelar: any = null;
  busquedaServicioContratado: string = '';
  serviciosContratadosFiltrados: ServicioContratado[] = [];
  servicioContratadoSeleccionadoNombre: string = '';

  constructor(
    private calendarService: CalendarService,
    private swalService: SwalService,
    private pacientesService: PacientesService,
    private servicioContratadoService: ServicioContratadoService,
    private serviciosService: ServiciosService
  ) {
    moment.locale('es');
    this.currentWeekStart = moment().startOf('isoWeek');
    this.generateFifteenMinuteBlocks();
    this.loadWeekData();
    this.cargarPacientes();
    this.cargarServiciosIndividuales();
  }

  cargarServiciosIndividuales(): void {
    this.serviciosService.obtenerServiciosIndividuales().subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.serviciosIndividuales = response.data;
          this.serviciosFiltrados = response.data;
        } else {
          this.serviciosIndividuales = [];
        }
      },
      error: (err: any) => {
        console.error('Error cargando servicios individuales', err);
        this.serviciosIndividuales = [];
      }
    });
  }

  cargarPacientes(): void {
    this.pacientesService.obtenerPacientesCitas().subscribe({
      next: (data: any) => {
        this.pacientes = data
          .filter((p: any) => !p.enListaNegra)
          .map((p: any) => ({
            id: p._id,
            nombre: `${p.nombre} ${p.apeP ?? ''} ${p.apeM ?? ''}`.trim(),
            telefonoWhatsapp: p.telefonoWhatsapp,
            telefonoPaciente: p.telefonoPaciente,
            enListaNegra: p.enListaNegra
          }));
        this.pacientesFiltrados = this.pacientes;
      },
      error: (err: any) => {
        console.error('Error cargando pacientes', err);
        this.swalService.error('Error al cargar la lista de pacientes');
      }
    });
  }

  generateFifteenMinuteBlocks(): void {
    const start = moment().hour(9).minute(0);
    const end = moment().hour(20).minute(0);

    this.horasDelDia = [];
    while (start.isBefore(end)) {
      const block = `${start.format('HH:mm')}`;
      this.horasDelDia.push(block);
      start.add(15, 'minutes');
    }
  }

  loadWeekData(): void {
    const startDate = this.currentWeekStart.format('YYYY-MM-DD');
    const endDate = this.currentWeekStart.clone().add(6, 'days').format('YYYY-MM-DD');

    this.cargando = true;
    this.calendarService.agendaAnualDetallada(startDate, endDate).subscribe({
      next: (data: DiaAgenda[]) => {
        this.weeks = this.organizeDataByWeek(data);
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error:', error);
        this.swalService.error('Error al obtener los horarios');
        this.cargando = false;
      }
    });
  }

  organizeDataByWeek(data: DiaAgenda[]): DiaSemana[][] {
    const weekDays: DiaSemana[] = [];
    const hoy = moment().startOf('day'); // Fecha actual (sin horas/minutos)

    // Primero crear la estructura base de días y horarios
    for (let i = 0; i < 6; i++) {
      const day = this.currentWeekStart.clone().add(i, 'days');

      // Calcular si el día es pasado
      const diaMoment = day.startOf('day');
      const esPasadoDia = diaMoment.isBefore(hoy);

      const horarios: Horario[] = [];

      // Generar bloques de 15 minutos
      const start = moment().hour(9).minute(0);
      const end = moment().hour(20).minute(0);
      let current = start.clone();

      while (current.isBefore(end)) {
        const horaInicio = current.format('HH:mm');
        const horaFin = current.clone().add(15, 'minutes').format('HH:mm');

        horarios.push({
          hora: `${horaInicio} - ${horaFin}`,
          disponible: true,
          eventos: [],
          esCitaExistente: false,
          esBloqueo: false,
          esBloqueoPersonal: false,
          esBloqueoGeneral: false,
          esPasado: false,
          esPrimerBloqueEvento: false,
          textoMostrar: ''
        });
        current.add(15, 'minutes');
      }

      weekDays.push({
        fecha: day.format('YYYY-MM-DD'),
        nombre: day.format('dddd').charAt(0).toUpperCase() + day.format('dddd').slice(1),
        fechaFormateada: day.format('D [de] MMMM'),
        horarios,
        esPasadoDia: esPasadoDia // Añade esta línea
      });
    }

    // Procesar datos de agenda
    data.forEach(dia => {
      const dayIndex = weekDays.findIndex(d => d.fecha === dia.fecha);
      if (dayIndex !== -1) {

        // Variable para rastrear el evento anterior
        let eventoAnterior: { tipo?: string, descripcion?: string, eventoId?: string } = {};

        dia.agenda.forEach((slot: SlotAgenda) => {
          const start = moment(slot.hora_inicio, 'HH:mm');
          const end = moment(slot.hora_fin, 'HH:mm');
          const duration = moment.duration(end.diff(start));
          const blocks = duration.asMinutes() / 15;

          // Generar un ID único para este slot para agrupación
          const slotId = `${slot.tipo}_${slot.descripcion || ''}_${slot.eventoId || Date.now()}`;

          for (let i = 0; i < blocks; i++) {
            const slotStart = start.clone().add(i * 15, 'minutes');
            const slotEnd = slotStart.clone().add(15, 'minutes');
            const hora = `${slotStart.format('HH:mm')} - ${slotEnd.format('HH:mm')}`;

            const horario = weekDays[dayIndex].horarios.find(h => h.hora === hora);
            if (horario) {
              // Crear objeto de evento
              const evento: EventoAgenda = {
                tipo: slot.tipo,
                subtipo: slot.subtipo,
                descripcion: slot.descripcion,
                detalles: `${slot.tipo} (${slot.hora_inicio} - ${slot.hora_fin})`,
                color: slot.color,
                eventoId: slot.eventoId,
                esPrimerBloque: i === 0, // Solo el primer bloque tendrá texto completo
                eventoAgrupadoId: slotId
              };

              horario.eventos.push(evento);

              // Determinar si es el mismo evento que el bloque anterior
              const esMismoEvento = (
                eventoAnterior.tipo === slot.tipo &&
                eventoAnterior.descripcion === slot.descripcion &&
                eventoAnterior.eventoId === slot.eventoId
              );

              evento.esMismoEventoQueAnterior = esMismoEvento;

              // Manejar diferentes tipos de slots
              if (slot.tipo === 'pasado') {
                horario.disponible = false;
                horario.esPasado = true;
              } else if (slot.tipo === 'disponible') {
                horario.disponible = true;
              } else if (slot.tipo !== 'disponible' && slot.tipo !== 'pasado') {
                horario.disponible = false;

                // Determinar tipo de evento
                if (slot.tipo === 'cita' ||
                  slot.tipo.toLowerCase().includes('sesión') ||
                  (slot.descripcion && slot.descripcion.toLowerCase().includes('paciente'))) {
                  horario.esCitaExistente = true;
                }

                if (slot.tipo === 'bloqueo') {
                  horario.esBloqueo = true;
                  if (slot.subtipo === 'personal') {
                    horario.esBloqueoPersonal = true;
                  } else {
                    horario.esBloqueoGeneral = true;
                  }
                }

                // Establecer texto a mostrar (solo en el primer bloque)
                if (i === 0) {
                  horario.esPrimerBloqueEvento = true;
                  if (slot.tipo === 'cita' && slot.descripcion) {
                    // Formato mejorado para citas
                    horario.textoMostrar = slot.descripcion.split(' - ')[0]; // Solo el nombre del servicio
                  } else if (slot.tipo === 'bloqueo') {
                    // Formato para bloqueos
                    horario.textoMostrar = slot.subtipo || 'Bloqueo';
                    if (slot.descripcion) {
                      horario.textoMostrar = `${horario.textoMostrar}: ${slot.descripcion}`;
                    }
                  } else {
                    horario.textoMostrar = slot.descripcion || slot.tipo;
                  }
                } else {
                  // Para bloques que no son el primero, establecer texto especial
                  horario.textoMostrar = '→'; // Flecha para indicar continuidad
                }
              }

              // Actualizar evento anterior
              eventoAnterior = {
                tipo: slot.tipo,
                descripcion: slot.descripcion,
                eventoId: slot.eventoId
              };
            }
          }

          // Reiniciar el evento anterior cuando cambiamos de slot
          eventoAnterior = {};
        });
      }
    });

    return [weekDays];
  }


  previousWeek(): void {
    this.currentWeekStart.subtract(1, 'week');
    this.loadWeekData();
  }

  nextWeek(): void {
    this.currentWeekStart.add(1, 'week');
    this.loadWeekData();
  }

  goToCurrentWeek(): void {
    this.currentWeekStart = moment().startOf('isoWeek');
    this.loadWeekData();
  }

  getWeekRange(): string {
    const start = this.currentWeekStart.format('D [de] MMMM');
    const end = this.currentWeekStart.clone().add(6, 'days').format('D [de] MMMM');
    return `${start} al ${end}`;
  }

  getDetalles(eventos: EventoAgenda[] | undefined): string {
    if (!eventos || eventos.length === 0) {
      return 'Disponible';
    }

    return eventos.map(e => {
      if (e.descripcion) {
        return e.descripcion;
      } else if (e.detalles) {
        return e.detalles;
      } else {
        return e.tipo;
      }
    }).join('\n');
  }

  onSlotClick(dia: DiaSemana, horario: Horario): void {
    const horaInicio = horario.hora.split(' - ')[0];
    const fechaHoraSlot = moment(`${dia.fecha} ${horaInicio}`);

    // Permitir ver detalles incluso si es pasado, pero no permitir otras acciones
    const esSlotPasado = fechaHoraSlot.isBefore(moment());

    if (this.modoBloqueo) {
      if (esSlotPasado) {
        this.swalService.warning('No se puede bloquear un horario que ya ha pasado');
        return;
      }
      this.manejarSeleccionBloqueo(dia, horario);
      return;
    }

    // Verificar si es un bloqueo
    if (horario.esBloqueo || horario.esBloqueoPersonal || horario.esBloqueoGeneral) {
      if (esSlotPasado) {
        this.swalService.info('Este bloqueo ya ha pasado y no se puede modificar');
        return;
      }
      this.mostrarOpcionesBloqueo(dia.fecha, horario);
      return;
    }

    if (esSlotPasado && !horario.esCitaExistente) {
      this.swalService.info('Este horario ya ha pasado');
      return;
    }

    if (horario.esCitaExistente || (!horario.disponible && horario.eventos.length > 0)) {
      const hora12h = this.convertirHora12h(horario.hora.split(' - ')[0]);
      const ampm = horario.hora.split(' - ')[0] >= '12:00' ? 'pm' : 'am';

      this.cargando = true;
      this.calendarService.obtenerDetallesEvento(dia.fecha, hora12h, ampm).subscribe({
        next: (response: any) => {
          this.cargando = false;
          if (response.existe) {
            this.mostrarDetallesCitaModal(response);
          } else {
            this.swalService.warning('No se encontraron detalles para esta cita');
          }
        },
        error: (err: any) => {
          this.cargando = false;
          console.error('Error al obtener detalles de la cita:', err);
          this.swalService.error('Error al obtener detalles de la cita');
        }
      });
      return;
    }

    if (horario.disponible && !esSlotPasado) {
      const horaInicio = horario.hora.split(' - ')[0];
      this.mostrarModalCitaFunc(dia.fecha, horaInicio, horaInicio);
      return;
    }



    this.swalService.warning('Este horario no está disponible');
  }

  mostrarModalCitaFunc(fecha: string, horaInicio: string, horaFin: string): void {
    this.pacienteSeleccionado = null;
    this.serviciosContratados = [];
    this.usarServicioContratado = false;
    this.servicioContratadoSeleccionado = '';
    this.servicioContratadoSeleccionadoNombre = '';
    this.servicioIndividualSeleccionado = '';
    this.observaciones = '';
    this.pacientesFiltrados = this.pacientes;
    this.serviciosFiltrados = this.serviciosIndividuales;
    this.busquedaPaciente = '';
    this.busquedaServicio = '';
    this.busquedaServicioContratado = '';
    this.serviciosContratadosFiltrados = [];

    this.modalFecha = fecha;
    this.modalHoraInicio = horaInicio;
    this.modalHoraFin = horaFin;
    this.mostrarModalCita = true;
  }

  async cargarServiciosContratados(pacienteId: string): Promise<void> {
    try {
      const response = await this.servicioContratadoService
        .obtenerServiciosPorPaciente(pacienteId, 'activo')
        .toPromise();

      if (response && response.data) {
        this.serviciosContratados = response.data.filter((servicio: any) =>
          servicio.sesionesRestantes > 0 && servicio.estado === 'activo'
        );
        // Inicializar lista filtrada
        this.serviciosContratadosFiltrados = [];
      } else {
        this.serviciosContratados = [];
        this.serviciosContratadosFiltrados = [];
      }
    } catch (error: any) {
      console.error('Error cargando servicios contratados:', error);
      this.serviciosContratados = [];
      this.serviciosContratadosFiltrados = [];
    }
  }

  enviarCitaAlBackend(payload: {
    pacienteId: string;
    fecha: string;
    hora: string;
    ampm: string;
    servicioContratadoId?: string;
    servicioId?: string;
    observaciones?: string;
  }): void {
    this.calendarService.generarCita(payload).subscribe({
      next: (resp: any) => {
        let mensaje = 'Cita creada con éxito';
        if (payload.servicioContratadoId) {
          mensaje = `Cita creada usando 1 sesión. Sesiones restantes: ${resp.servicioContratado?.sesionesRestantes || 0}`;
        } else if (payload.servicioId) {
          const servicio = this.serviciosIndividuales.find(s => s._id === payload.servicioId);
          if (servicio) {
            mensaje = `Cita de ${servicio.nombre} agendada exitosamente. Costo: $${servicio.costo}`;
          }
        }

        this.swalService.success(mensaje);
        this.loadWeekData();
        this.cerrarModalCita();
      },
      error: (err: any) => {
        console.error(err);
        this.swalService.error(err.error?.error || 'No se pudo agendar la cita');
      }
    });
  }

  convertirAMPM(hora24: string): string {
    const [hora] = hora24.split(':').map(Number);
    return hora >= 12 ? 'pm' : 'am';
  }

  convertirHora12h(hora24: string): string {
    const [hora, minutos] = hora24.split(':').map(Number);
    let hora12 = hora % 12;
    hora12 = hora12 === 0 ? 12 : hora12;
    return `${hora12}:${minutos.toString().padStart(2, '0')}`;
  }

  mostrarOpcionesBloqueo(fecha: string, horario: Horario): void {
    // Busca un evento de bloqueo que tenga eventoId
    const eventoBloqueo = horario.eventos.find(ev => ev.tipo === 'bloqueo' && ev.eventoId);

    if (!eventoBloqueo) {
      this.swalService.warning('Este bloqueo no puede ser eliminado desde aquí (ID no disponible)');
      return;
    }

    // Verificar si el bloqueo ya pasó
    const horaInicio = horario.hora.split(' - ')[0];
    const fechaHoraSlot = moment(`${fecha} ${horaInicio}`);
    const esBloqueoPasado = fechaHoraSlot.isBefore(moment());

    if (esBloqueoPasado) {
      Swal.fire({
        title: 'Horario Bloqueado (Pasado)',
        html: `
        <div style="text-align: left;">
          <p><strong>Tipo:</strong> ${eventoBloqueo.subtipo || 'Bloqueo'}</p>
          <p><strong>Descripción:</strong> ${eventoBloqueo.descripcion || 'Sin descripción'}</p>
          <p><strong>Horario:</strong> ${horario.hora}</p>
          <p><strong>Estado:</strong> Este bloqueo ya ha pasado y no se puede modificar</p>
        </div>
      `,
        icon: 'info',
        confirmButtonText: 'Cerrar',
        customClass: {
          popup: 'swal2-wide'
        }
      });
      return;
    }

    Swal.fire({
      title: 'Horario Bloqueado',
      html: `
      <div style="text-align: left;">
        <p><strong>Tipo:</strong> ${eventoBloqueo.subtipo || 'Bloqueo'}</p>
        <p><strong>Descripción:</strong> ${eventoBloqueo.descripcion || 'Sin descripción'}</p>
        <p><strong>Horario:</strong> ${horario.hora}</p>
      </div>
    `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Eliminar bloqueo',
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#d33',
      customClass: {
        popup: 'swal2-wide'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.confirmarEliminacionBloqueo(fecha, horario, eventoBloqueo);
      }
    });
  }

  confirmarEliminacionBloqueo(fecha: string, horario: Horario, evento: EventoAgenda): void {
    // Usa el eventoId (ID de Google Calendar)
    if (!evento.eventoId) {
      this.swalService.error('No se pudo identificar el bloqueo (ID no disponible)');
      return;
    }

    Swal.fire({
      title: '¿Eliminar bloqueo?',
      text: 'Esta acción eliminará el bloqueo permanentemente.',
      icon: 'warning',
      input: 'text',
      inputLabel: 'Motivo de eliminación (opcional)',
      inputPlaceholder: 'Ej: Error en programación, cambio de horario...',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: (motivo) => {
        // Obtener usuario actual
        const usuarioStr = localStorage.getItem('usuarioAutenticado');
        let usuarioActual = null;

        if (usuarioStr) {
          try {
            usuarioActual = JSON.parse(usuarioStr);
          } catch (e) {
            console.error('Error al parsear usuario:', e);
          }
        }

        // Usa evento.eventoId que es el ID de Google Calendar
        return this.calendarService.eliminarBloqueo(
          evento.eventoId!, // ← Usa el eventoId aquí
          motivo || '',
          usuarioActual?._id || usuarioActual?.id || 'sistema'
        ).toPromise();
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        this.swalService.success('Bloqueo eliminado exitosamente');
        this.loadWeekData();
      }
    });
  }

  // Método para crear el bloqueo
  crearBloqueo(datos: any): void {
    this.calendarService.crearBloqueoDesdeSeleccion(datos).subscribe({
      next: (respuesta: any) => {
        if (respuesta.success) {
          this.swalService.success('Bloqueo creado exitosamente');
          this.loadWeekData();
        } else {
          this.swalService.error(respuesta.error || 'Error al crear el bloqueo');
        }
        this.cancelarSeleccionBloqueo();
      },
      error: (error: any) => {
        console.error('Error al crear bloqueo:', error);
        this.swalService.error(error.error?.error || 'Error al crear el bloqueo');
        this.cancelarSeleccionBloqueo();
      }
    });
  }

  // Método para obtener el usuario actual
  obtenerUsuarioActual(): { id: string; nombre: string } | null {
    try {
      const usuarioStr = localStorage.getItem('usuarioAutenticado');
      if (usuarioStr) {
        const usuario = JSON.parse(usuarioStr);
        return {
          id: usuario._id || usuario.id,
          nombre: usuario.usuario || usuario.nombre || 'Usuario'
        };
      }
    } catch (error) {
      console.error('Error al obtener usuario:', error);
    }
    return null;
  }

  // Método para activar/desactivar modo bloqueo
  toggleModoBloqueo(): void {
    this.modoBloqueo = !this.modoBloqueo;
    this.cancelarSeleccionBloqueo();

    if (this.modoBloqueo) {
      this.swalService.info('Modo bloqueo activado. Selecciona el horario de inicio y luego el de fin para crear un bloqueo.');
    }
  }

  manejarSeleccionBloqueo(dia: DiaSemana, horario: Horario): void {
    const horaInicio = horario.hora.split(' - ')[0];
    const slotId = `${dia.fecha}_${horaInicio}`;

    if (this.esSlotPasado(dia.fecha, horaInicio)) {
      this.swalService.warning('No se puede bloquear un horario que ya ha pasado');
      return;
    }
    // No permitir bloquear slots ocupados
    if (!horario.disponible || horario.esCitaExistente || horario.esBloqueo) {
      this.swalService.warning('No puedes bloquear un horario que ya está ocupado');
      return;
    }

    if (!this.seleccionandoBloqueo) {
      // Primera selección: inicio del bloqueo
      this.bloqueoInicio = { fecha: dia.fecha, hora: horaInicio };
      this.seleccionandoBloqueo = true;
      this.slotsSeleccionados = [slotId];

      this.swalService.info(`Inicio del bloqueo: ${dia.fecha} ${horaInicio}. Selecciona el horario de fin.`);
    } else {
      // Segunda selección: fin del bloqueo
      this.bloqueoFin = { fecha: dia.fecha, hora: horaInicio };

      // Verificar que el fin sea posterior al inicio
      const inicioMoment = moment(`${this.bloqueoInicio?.fecha} ${this.bloqueoInicio?.hora}`, 'YYYY-MM-DD HH:mm');
      const finMoment = moment(`${this.bloqueoFin.fecha} ${this.bloqueoFin.hora}`, 'YYYY-MM-DD HH:mm');

      if (finMoment.isSameOrBefore(inicioMoment)) {
        this.swalService.error('La hora de fin debe ser posterior a la hora de inicio');
        this.cancelarSeleccionBloqueo();
        return;
      }

      // Verificar disponibilidad del slot completo
      this.verificarYConfirmarBloqueo();
    }
  }

  // Verificar disponibilidad y mostrar confirmación
  verificarYConfirmarBloqueo(): void {
    this.calendarService.verificarSlotParaBloqueo(
      this.bloqueoInicio!.fecha,
      this.bloqueoInicio!.hora,
      this.bloqueoFin!.hora
    ).subscribe({
      next: (verificacion: any) => {
        if (verificacion.disponible) {
          this.prepararModalConfirmarBloqueo(verificacion);
        } else {
          this.swalService.error(`No se puede crear el bloqueo: ${verificacion.motivo}`);
          this.cancelarSeleccionBloqueo();
        }
      },
      error: (err: any) => {
        this.swalService.error('Error al verificar disponibilidad');
        this.cancelarSeleccionBloqueo();
      }
    });
  }

  prepararModalConfirmarBloqueo(verificacion: any): void {
    const inicioMoment = moment(`${this.bloqueoInicio!.fecha} ${this.bloqueoInicio!.hora}`, 'YYYY-MM-DD HH:mm');
    const finMoment = moment(`${this.bloqueoFin!.fecha} ${this.bloqueoFin!.hora}`, 'YYYY-MM-DD HH:mm');
    const duracion = moment.duration(finMoment.diff(inicioMoment));
    const duracionHoras = duracion.asHours();
    const duracionMinutos = duracion.asMinutes();

    this.detallesBloqueo = {
      fechaFormateada: moment(this.bloqueoInicio!.fecha).format('dddd, D [de] MMMM'),
      horaInicio: this.bloqueoInicio!.hora,
      horaFin: this.bloqueoFin!.hora,
      duracionHoras: duracionHoras.toFixed(1),
      duracionMinutos: duracionMinutos,
      tipo: 'personal',
      motivo: ''
    };

    this.mostrarModalConfirmarBloqueo = true;
  }

  cancelarSeleccionBloqueo(): void {
    this.seleccionandoBloqueo = false;
    this.bloqueoInicio = null;
    this.bloqueoFin = null;
    this.slotsSeleccionados = [];
  }

  esSlotPasado(fecha: string, hora: string): boolean {
    const horaInicio = hora.includes('-') ? hora.split(' - ')[0] : hora;
    const fechaHoraSlot = moment(`${fecha} ${horaInicio}`, 'YYYY-MM-DD HH:mm');
    return fechaHoraSlot.isBefore(moment());
  }

  cerrarModalCita(): void {
    this.mostrarModalCita = false;
  }

  filtrarPacientes(): void {
    const valor = this.busquedaPaciente.toLowerCase();
    this.pacientesFiltrados = this.pacientes.filter(p => {
      const nombre = (p.nombre ?? '').toLowerCase();
      const telefono = String(p.telefonoWhatsapp ?? p.telefonoPaciente ?? '').toLowerCase();
      return nombre.includes(valor) || telefono.includes(valor);
    });
  }

  async seleccionarPacienteModal(paciente: PacienteBuscado): Promise<void> {
    this.pacienteSeleccionado = paciente;
    this.busquedaPaciente = `${paciente.nombre} (${paciente.telefonoWhatsapp || paciente.telefonoPaciente || ''})`;
    this.serviciosContratadosFiltrados = []; // Limpiar resultados anteriores
    this.busquedaServicioContratado = ''; // Limpiar búsqueda

    // Cargar servicios contratados
    await this.cargarServiciosContratados(paciente.id);
  }

  filtrarServicios(): void {
    const valor = this.busquedaServicio.toLowerCase();
    this.serviciosFiltrados = this.serviciosIndividuales.filter(servicio => {
      const nombre = (servicio.nombre ?? '').toLowerCase();
      const categoria = (servicio.categoria?.nombre ?? '').toLowerCase();
      const descripcion = (servicio.descripcionCorta ?? '').toLowerCase();
      return nombre.includes(valor) || categoria.includes(valor) || descripcion.includes(valor);
    });
  }

  seleccionarServicioIndividual(servicio: ServicioIndividual): void {
    this.servicioIndividualSeleccionado = servicio._id;
    this.busquedaServicio = `${servicio.categoria.nombre} - ${servicio.nombre}`;
  }

  toggleUsarServicioContratado(): void {
    if (this.usarServicioContratado) {
      this.servicioIndividualSeleccionado = '';
      this.busquedaServicio = '';
      // Limpiar búsqueda de servicios contratados
      this.busquedaServicioContratado = '';
      this.serviciosContratadosFiltrados = [];
      this.servicioContratadoSeleccionadoNombre = '';
    } else {
      this.servicioContratadoSeleccionado = '';
      this.servicioContratadoSeleccionadoNombre = '';
      this.busquedaServicioContratado = '';
      this.serviciosContratadosFiltrados = [];
    }
  }

  onServicioContratadoChange(): void {
    if (this.servicioContratadoSeleccionado) {
      const servicio = this.serviciosContratados.find(s => s._id === this.servicioContratadoSeleccionado);
      this.servicioContratadoSeleccionadoNombre = servicio ? servicio.servicio.nombre : '';
    } else {
      this.servicioContratadoSeleccionadoNombre = '';
    }
  }

  getSesionesRestantes(): number {
    if (!this.servicioContratadoSeleccionado) return 0;
    const servicio = this.serviciosContratados.find(s => s._id === this.servicioContratadoSeleccionado);
    return servicio?.sesionesRestantes || 0;
  }

  getDuracionServicioContratado(): number {
    if (!this.servicioContratadoSeleccionado) return 0;
    const servicio = this.serviciosContratados.find(s => s._id === this.servicioContratadoSeleccionado);
    return servicio?.servicio.duracion || 0;
  }

  getDuracionServicioIndividual(): number {
    const servicio = this.serviciosIndividuales.find(s => s._id === this.servicioIndividualSeleccionado);
    return servicio?.duracion || 0;
  }

  getCostoServicioIndividual(): number {
    const servicio = this.serviciosIndividuales.find(s => s._id === this.servicioIndividualSeleccionado);
    return servicio?.costo || 0;
  }

  validarFormularioCita(): boolean {
    if (!this.pacienteSeleccionado) return false;

    if (this.usarServicioContratado) {
      if (!this.servicioContratadoSeleccionado) return false;
      const servicio = this.serviciosContratados.find(s => s._id === this.servicioContratadoSeleccionado);
      if (!servicio || servicio.sesionesRestantes <= 0) return false;
    } else {
      if (!this.servicioIndividualSeleccionado) return false;
    }

    return true;
  }

  confirmarCitaModal(): void {
    if (!this.validarFormularioCita()) {
      this.swalService.warning('Por favor completa todos los campos requeridos');
      return;
    }

    const payload = {
      pacienteId: this.pacienteSeleccionado!.id,
      servicioContratadoId: this.usarServicioContratado && this.servicioContratadoSeleccionado ? this.servicioContratadoSeleccionado : undefined,
      servicioId: !this.usarServicioContratado && this.servicioIndividualSeleccionado ? this.servicioIndividualSeleccionado : undefined,
      fecha: this.modalFecha,
      hora: this.modalHoraInicio,
      ampm: this.convertirAMPM(this.modalHoraInicio),
      observaciones: this.observaciones || undefined
    };

    this.enviarCitaAlBackend(payload);
  }

  // === MÉTODOS PARA MODALES DE CITA (manteniendo HTML) ===

  mostrarDetallesCitaModal(response: any): void {
    const evento = response.evento;
    const cita = response.cita;

    const inicio = moment(evento.start.dateTime);
    const fin = moment(evento.end.dateTime);
    const duracion = fin.diff(inicio, 'minutes');

    // Verificar si la cita ya pasó
    const esCitaPasada = inicio.isBefore(moment());

    this.detallesCitaSeleccionada = {
      pacienteNombre: cita?.pacienteId?.nombre || 'No disponible',
      pacienteTelefono: cita?.pacienteId?.telefonoWhatsapp || cita?.pacienteId?.telefonoPaciente || 'No disponible',
      tipoCita: cita?.tipoCita || 'Cita',
      fechaHora: inicio.format('dddd, D [de] MMMM [a las] h:mm a'),
      duracion: duracion,
      observaciones: cita?.observaciones || 'Ninguna',
      servicioContratado: cita?.servicioContratadoId ? {
        nombre: cita.servicioContratadoId.servicio?.nombre || 'Servicio contratado',
        sesionesRestantes: cita.servicioContratadoId.sesionesRestantes
      } : null,
      servicioIndividual: !!cita?.servicioId,
      enlaceGoogleCalendar: evento.htmlLink,
      esPasada: esCitaPasada
    };

    this.citaParaCancelar = response;
    this.mostrarModalDetallesCita = true;
  }


  cerrarModalDetallesCita(): void {
    this.mostrarModalDetallesCita = false;
    this.detallesCitaSeleccionada = null;
  }

  iniciarCancelacionCita(): void {
    this.cerrarModalDetallesCita();
    this.mostrarModalCancelarCita = true;
  }

  cerrarModalCancelarCita(): void {
    this.mostrarModalCancelarCita = false;
    this.motivoCancelacion = '';
  }

  confirmarCancelacionDesdeModal(): void {
    if (!this.citaParaCancelar) {
      this.swalService.error('No hay cita seleccionada para cancelar');
      return;
    }

    const eventoId = this.citaParaCancelar.evento.id;
    const servicioContratadoId = this.citaParaCancelar.cita?.servicioContratadoId?._id ||
      this.citaParaCancelar.cita?.servicioContratadoId;

    this.calendarService.eliminarCita(
      eventoId,
      this.motivoCancelacion,
      servicioContratadoId
    ).subscribe({
      next: (resp: any) => {
        let mensaje = 'Cita cancelada exitosamente';
        if (resp.servicioContratadoRestaurado) {
          mensaje += `. Se ha restaurado 1 sesión. Sesiones restantes: ${resp.sesionesRestantes}`;
        }

        this.swalService.success(mensaje);
        this.loadWeekData();
        this.cerrarModalCancelarCita();
      },
      error: (err: any) => {
        console.error('Error al cancelar cita:', err);
        this.swalService.error('No se pudo cancelar la cita. ' + (err.error?.error || 'Error interno'));
      }
    });
  }

  // === MÉTODOS PARA MODALES DE BLOQUEO (solo para crear nuevos) ===

  cerrarModalConfirmarBloqueo(): void {
    this.mostrarModalConfirmarBloqueo = false;
    this.detallesBloqueo = {
      fechaFormateada: '',
      horaInicio: '',
      horaFin: '',
      duracionHoras: '',
      duracionMinutos: 0,
      tipo: 'personal',
      motivo: ''
    };
  }

  crearBloqueoDesdeModal(): void {
    const usuario = this.obtenerUsuarioActual();
    if (!usuario) {
      this.swalService.error('No se pudo identificar al usuario');
      return;
    }

    const datos = {
      fecha: this.bloqueoInicio!.fecha,
      horaInicio: this.bloqueoInicio!.hora,
      horaFin: this.bloqueoFin!.hora,
      motivo: this.detallesBloqueo.motivo,
      tipo: this.detallesBloqueo.tipo,
      creadoPorId: usuario.id,
      creadoPorNombre: usuario.nombre
    };

    this.crearBloqueo(datos);
    this.cerrarModalConfirmarBloqueo();
  }

  // Método para filtrar servicios contratados
  filtrarServiciosContratados(): void {
    const valor = this.busquedaServicioContratado.toLowerCase();
    this.serviciosContratadosFiltrados = this.serviciosContratados.filter(servicio => {
      const nombreServicio = (servicio.servicio.nombre ?? '').toLowerCase();
      const estado = (servicio.estado ?? '').toLowerCase();
      return nombreServicio.includes(valor) || estado.includes(valor);
    });
  }

  // Método para seleccionar servicio contratado desde el buscador
  seleccionarServicioContratado(servicio: ServicioContratado): void {
    this.servicioContratadoSeleccionado = servicio._id;
    this.servicioContratadoSeleccionadoNombre = servicio.servicio.nombre;
    this.busquedaServicioContratado = ''; // Limpiar búsqueda
    this.serviciosContratadosFiltrados = [];
  }

  getTextoMostrar(dia: DiaSemana, horaIndex: number): string {
    const horario = dia.horarios[horaIndex];

    if (horario.textoMostrar && horario.textoMostrar !== '→') {
      return horario.textoMostrar;
    }

    if (horario.eventos.length > 0) {
      const evento = horario.eventos[0];

      // Para bloques que no son el primero, mostrar flecha de continuidad
      if (horario.textoMostrar === '→') {
        return '→';
      }

      // Si no tiene textoMostrar definido, usar lógica antigua
      if (evento.descripcion) {
        // Para citas, mostrar solo el nombre del servicio
        if (evento.tipo === 'cita') {
          return evento.descripcion.split(' - ')[0];
        }
        return evento.descripcion;
      } else if (evento.detalles) {
        return evento.detalles;
      } else {
        return evento.tipo;
      }
    }

    return '';
  }


}