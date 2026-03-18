import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorariosService } from 'src/app/services/horarios.service';
import { CalendarioService } from 'src/app/services/calendario.service';

interface Turno {
  horaInicio: string;
  horaFin: string;
}

interface DiaHorario {
  diaSemana: number;
  nombreDia: string;
  activo: boolean;
  turnos: Turno[];
}

type FiltroDia = 'todos' | 'con-turno' | 'sin-turno';

@Component({
  selector: 'app-form-horarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-horarios.component.html',
  styleUrls: ['./form-horarios.component.scss']
})
export class FormHorariosComponent implements OnInit {

  doctores: any[] = [];
  doctorSeleccionado: string = '';

  // Búsqueda de especialista (autocomplete)
  busquedaDoctor: string = '';
  showSuggestions: boolean = false;

  // Cierra el desplegable al hacer clic fuera del componente
  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    if (!target.closest('.doctor-autocomplete')) {
      this.showSuggestions = false;
    }
  }

  cargando: boolean = false;
  guardando: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  // Plantilla base para los 7 días
  semana: DiaHorario[] = [];
  nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Filtros de días
  busquedaDia: string = '';
  filtroEstadoDia: FiltroDia = 'todos';

  constructor(
    private horariosService: HorariosService,
    private calendarioService: CalendarioService
  ) {}

  ngOnInit(): void {
    this.cargarDoctores();
    this.inicializarSemanaVacia();
  }

  // ——— Doctores ———

  inicializarSemanaVacia(): void {
    this.semana = this.nombresDias.map((nombre, index) => ({
      diaSemana: index,
      nombreDia: nombre,
      activo: false,
      turnos: []
    }));
  }

  cargarDoctores(): void {
    this.calendarioService.getDoctoresActivos().subscribe({
      next: (data) => this.doctores = data,
      error: (err) => console.error('Error al cargar doctores', err)
    });
  }

  // Doctores filtrados por el campo de búsqueda
  get doctoresFiltrados(): any[] {
    const texto = this.busquedaDoctor.toLowerCase().trim();
    if (!texto) return this.doctores;
    return this.doctores.filter(d =>
      `${d.nombre} ${d.apeP || ''}`.toLowerCase().includes(texto)
    );
  }

  // Nombre del doctor actualmente seleccionado (para mostrar en el resumen)
  get nombreDoctorSeleccionado(): string {
    const doc = this.doctores.find(d => (d.id || d._id) === this.doctorSeleccionado);
    return doc ? `${doc.nombre} ${doc.apeP || ''}`.trim() : '';
  }

  // Selecciona un doctor desde el autocomplete
  selectDoctor(doc: any): void {
    this.doctorSeleccionado = doc.id || doc._id;
    this.busquedaDoctor = `${doc.nombre} ${doc.apeP || ''}`.trim();
    this.showSuggestions = false;
    this.onDoctorChange();
  }

  onDoctorChange(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (!this.doctorSeleccionado) {
      this.inicializarSemanaVacia();
      return;
    }

    this.cargando = true;
    this.horariosService.obtenerHorarioPorUsuario(this.doctorSeleccionado).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mapearHorarioExistente(res.horario);
      },
      error: (err) => {
        this.cargando = false;
        this.inicializarSemanaVacia();
        if (err.status !== 404) {
          console.error('Error al traer horario:', err);
        }
      }
    });
  }

  mapearHorarioExistente(horarioDb: any[]): void {
    this.inicializarSemanaVacia();
    horarioDb.forEach(diaDb => {
      const diaLocal = this.semana.find(d => d.diaSemana === diaDb.diaSemana);
      if (diaLocal) {
        diaLocal.activo = diaDb.activo;
        diaLocal.turnos = diaDb.turnos ? JSON.parse(JSON.stringify(diaDb.turnos)) : [];
      }
    });
  }

  // ——— Filtros de días ———

  setFiltroEstadoDia(filtro: FiltroDia): void {
    this.filtroEstadoDia = filtro;
  }

  // Días visibles después de aplicar búsqueda + filtro de estado
  get diasFiltrados(): DiaHorario[] {
    const texto = this.busquedaDia.toLowerCase().trim();

    return this.semana.filter(dia => {
      const coincideTexto = !texto || dia.nombreDia.toLowerCase().includes(texto);
      const coincideEstado =
        this.filtroEstadoDia === 'todos' ||
        (this.filtroEstadoDia === 'con-turno' && dia.activo) ||
        (this.filtroEstadoDia === 'sin-turno' && !dia.activo);
      return coincideTexto && coincideEstado;
    });
  }

  get totalDiasActivos(): number {
    return this.semana.filter(d => d.activo).length;
  }

  get totalDiasInactivos(): number {
    return this.semana.filter(d => !d.activo).length;
  }

  limpiarFiltrosDias(): void {
    this.busquedaDia = '';
    this.filtroEstadoDia = 'todos';
  }

  // ——— Turnos ———

  agregarTurno(dia: DiaHorario): void {
    dia.turnos.push({ horaInicio: '', horaFin: '' });
    dia.activo = true;
  }

  eliminarTurno(dia: DiaHorario, index: number): void {
    dia.turnos.splice(index, 1);
    if (dia.turnos.length === 0) {
      dia.activo = false;
    }
  }

  guardarConfiguracion(): void {
    if (!this.doctorSeleccionado) {
      this.mensajeError = 'Selecciona un especialista primero.';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const payload = this.semana.map(dia => {
      const turnosValidos = dia.activo ? dia.turnos.filter(t => t.horaInicio && t.horaFin) : [];
      return {
        diaSemana: dia.diaSemana,
        activo: dia.activo && turnosValidos.length > 0,
        turnos: turnosValidos
      };
    });

    this.horariosService.guardarHorario(this.doctorSeleccionado, payload).subscribe({
      next: () => {
        this.guardando = false;
        this.mensajeExito = 'Horario guardado correctamente.';
        this.onDoctorChange();
      },
      error: (err) => {
        this.guardando = false;
        this.mensajeError = 'Error al guardar la configuración.';
        console.error(err);
      }
    });
  }
}