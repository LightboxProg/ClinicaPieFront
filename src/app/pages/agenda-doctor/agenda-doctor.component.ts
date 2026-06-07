import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarService } from 'src/app/services/calendar.service';
import { SwalService } from 'src/app/services/swal.service';
import * as moment from 'moment';
import { FormsModule } from '@angular/forms';

// ——— Interfaces ———
interface EventoAgenda {
  tipo: string;
  descripcion?: string;
  detalles?: string;
  color?: string;
  eventoId?: string;
  doctor?: string;
  esPrimerBloque?: boolean;
  eventoAgrupadoId?: string;
}

interface Horario {
  hora: string;
  disponible: boolean;
  eventos: EventoAgenda[];
  esCitaExistente: boolean;
  esPrimerBloqueEvento?: boolean;
  esUltimoBloqueEvento?: boolean;
  textoMostrar?: string;
  colorEvento?: string;
}

interface DiaSemana {
  fecha: string;
  nombre: string;
  fechaFormateada: string;
  horarios: Horario[];
}

interface SlotAgenda {
  tipo: string;
  descripcion?: string;
  hora_inicio: string;
  hora_fin: string;
  color?: string;
  eventoId?: string;
  detalles?: string;
  slots?: number;
  doctor?: string;
  doctorId?: string;
}

interface DiaAgenda {
  fecha: string;
  agenda: SlotAgenda[];
}

// Doctor para el filtro
export interface DoctorFiltro {
  id: string;
  nombre: string;
  color: string;
  seleccionado: boolean;
}

@Component({
  selector: 'app-agenda-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda-doctor.component.html',
  styleUrls: ['./agenda-doctor.component.scss']
})
export class AgendaDoctorComponent implements OnInit {
  weeks: DiaSemana[][] = [];
  currentWeekStart: moment.Moment;
  cargando = false;
  cargandoDoctores = false;
  horasDelDia: string[] = [];

  // Datos del usuario actual
  usuarioId: string | null = null;
  usuarioTipo: string = '';
  tituloAgenda: string = 'Agenda';

  // Modal de detalles
  mostrarModalDetalles = false;
  eventoSeleccionado: any = null;

  // Modo de vista
  esVistaGeneral: boolean = false;

  // Sin calendario asignado
  sinCalendario: boolean = false;
  mensajeSinCalendario: string = '';

  // Filtro de doctores (solo en vista general)
  doctoresFiltro: DoctorFiltro[] = [];
  mostrarPanelFiltro: boolean = false;

  constructor(
    private calendarService: CalendarService,
    private swalService: SwalService
  ) {
    moment.locale('es');
    this.currentWeekStart = moment().startOf('isoWeek');
    this.generateFifteenMinuteBlocks();

    // Obtener datos del usuario autenticado
    const usuarioStr = localStorage.getItem('usuarioAutenticado');
    if (usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        this.usuarioId = usuario._id || usuario.id;
        this.usuarioTipo = usuario.tipo || '';

        if (['Administrador', 'Recepcionista'].includes(this.usuarioTipo)) {
          this.esVistaGeneral = true;
          this.tituloAgenda = 'Agenda General — Todos los Doctores';
        } else {
          this.esVistaGeneral = false;
          const nombre = usuario.nombre || 'Doctor';
          const apellido = usuario.apeP || '';
          this.tituloAgenda = `Agenda — Dr. ${nombre} ${apellido}`.trim();
        }
      } catch (e) {
        console.error('Error al parsear usuario', e);
      }
    }
  }

  ngOnInit(): void {
    if (this.esVistaGeneral) {
      // Primero cargar la lista de doctores y luego la agenda
      this.cargarListaDoctores();
    } else {
      this.loadWeekData();
    }
  }

  generateFifteenMinuteBlocks(): void {
    const start = moment().hour(9).minute(0);
    const end = moment().hour(20).minute(0);
    this.horasDelDia = [];
    while (start.isBefore(end)) {
      this.horasDelDia.push(start.format('HH:mm'));
      start.add(15, 'minutes');
    }
  }

  // ——— Filtro de doctores ———

  cargarListaDoctores(): void {
    this.cargandoDoctores = true;
    this.calendarService.obtenerListaDoctoresAgenda().subscribe({
      next: (doctores: any[]) => {
        // Todos seleccionados por defecto
        this.doctoresFiltro = doctores.map(d => ({ ...d, seleccionado: true }));
        this.cargandoDoctores = false;
        this.loadWeekData(); // Cargar agenda una vez que tenemos los doctores
      },
      error: (err) => {
        console.error('Error al cargar lista de doctores:', err);
        this.cargandoDoctores = false;
        this.loadWeekData(); // Intentar cargar agenda igual
      }
    });
  }

  get doctoresSeleccionadosCount(): number {
    return this.doctoresFiltro.filter(d => d.seleccionado).length;
  }

  get todosSeleccionados(): boolean {
    return this.doctoresFiltro.length > 0 && this.doctoresFiltro.every(d => d.seleccionado);
  }

  toggleTodos(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.doctoresFiltro.forEach(d => d.seleccionado = checked);
  }

  toggleDoctor(doctor: DoctorFiltro): void {
    doctor.seleccionado = !doctor.seleccionado;
  }

  aplicarFiltro(): void {
    this.mostrarPanelFiltro = false;
    this.loadWeekData();
  }

  // ——— Carga de datos ———

  loadWeekData(): void {
    const startDate = this.currentWeekStart.format('YYYY-MM-DD');
    const endDate = this.currentWeekStart.clone().add(6, 'days').format('YYYY-MM-DD');

    this.cargando = true;

    let peticion;

    if (this.esVistaGeneral) {
      // Obtener IDs de los doctores seleccionados en el filtro
      const idsSeleccionados = this.doctoresFiltro
        .filter(d => d.seleccionado)
        .map(d => d.id);

      peticion = this.calendarService.obtenerAgendaGeneral(startDate, endDate, idsSeleccionados);
    } else {
      peticion = this.calendarService.obtenerAgendaDoctor(this.usuarioId!, startDate, endDate);
    }

    peticion.subscribe({
      next: (data: any) => {
        // Doctor sin calendario asignado
        if (data && data.sinCalendario) {
          this.sinCalendario = true;
          this.mensajeSinCalendario = data.mensaje || 'No tienes un calendario de Google asignado.';
          this.weeks = [];
          this.cargando = false;
          return;
        }
        this.sinCalendario = false;
        this.weeks = this.organizeDataByWeek(data as DiaAgenda[]);
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al cargar agenda:', error);
        this.swalService.error('Error al obtener la agenda');
        this.cargando = false;
      }
    });
  }

  organizeDataByWeek(data: DiaAgenda[]): DiaSemana[][] {
    const weekDays: DiaSemana[] = [];

    for (let i = 0; i < 6; i++) {
      const day = this.currentWeekStart.clone().add(i, 'days');
      const horarios: Horario[] = [];
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
          esPrimerBloqueEvento: false,
          textoMostrar: '',
          colorEvento: ''
        });
        current.add(15, 'minutes');
      }

      weekDays.push({
        fecha: day.format('YYYY-MM-DD'),
        nombre: day.format('dddd').charAt(0).toUpperCase() + day.format('dddd').slice(1),
        fechaFormateada: day.format('D [de] MMMM'),
        horarios
      });
    }

    data.forEach(dia => {
      const dayIndex = weekDays.findIndex(d => d.fecha === dia.fecha);
      if (dayIndex === -1) return;

      dia.agenda.forEach((slot: SlotAgenda) => {
        if (slot.tipo === 'disponible') return;

        const start = moment(slot.hora_inicio, 'HH:mm');
        const end = moment(slot.hora_fin, 'HH:mm');
        const blocks = Math.ceil(moment.duration(end.diff(start)).asMinutes() / 15);
        const slotId = `${slot.tipo}_${slot.eventoId || Date.now()}`;

        for (let i = 0; i < blocks; i++) {
          const slotStart = start.clone().add(i * 15, 'minutes');
          const slotEnd = slotStart.clone().add(15, 'minutes');
          const hora = `${slotStart.format('HH:mm')} - ${slotEnd.format('HH:mm')}`;
          const horario = weekDays[dayIndex].horarios.find(h => h.hora === hora);

          if (horario) {
            horario.eventos.push({
              tipo: slot.tipo,
              descripcion: slot.descripcion,
              detalles: slot.detalles,
              color: slot.color,
              eventoId: slot.eventoId,
              doctor: slot.doctor,
              esPrimerBloque: i === 0,
              eventoAgrupadoId: slotId
            });
            horario.disponible = false;
            horario.esCitaExistente = true;
            horario.colorEvento = slot.color || '#d63384';

            if (i === 0) {
              horario.esPrimerBloqueEvento = true;
              const horaRango = `${slot.hora_inicio} - ${slot.hora_fin}`;
              const desc = slot.descripcion || 'Cita';
              horario.textoMostrar = this.esVistaGeneral
                ? `${horaRango}: ${desc} (Dr. ${slot.doctor || ''})`
                : `${horaRango}: ${desc}`;
            } else {
              horario.textoMostrar = '';
            }

            if (i === blocks - 1) {
              horario.esUltimoBloqueEvento = true;
            }
          }
        }
      });
    });

    return [weekDays];
  }

  // ——— Navegación ———

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

  // ——— Modal ———

  verDetalles(horario: Horario): void {
    if (horario.eventos.length > 0) {
      this.eventoSeleccionado = horario.eventos[0];
      this.mostrarModalDetalles = true;
    }
  }

  cerrarModal(): void {
    this.mostrarModalDetalles = false;
    this.eventoSeleccionado = null;
  }
}
