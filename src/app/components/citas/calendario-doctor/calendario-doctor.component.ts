import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarioService } from 'src/app/services/calendario.service';
import { LoginService } from 'src/app/services/login.service';
import { AgendarCitaComponent } from '../agendar-cita/agendar-cita.component';
import { RegendarCitasComponent } from '../regendar-citas/regendar-citas.component';
import * as moment from 'moment';

@Component({
  selector: 'app-calendario-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule, AgendarCitaComponent, RegendarCitasComponent],
  templateUrl: './calendario-doctor.component.html',
  styleUrls: ['./calendario-doctor.component.scss']
})
export class CalendarioDoctorComponent implements OnInit, OnChanges {

  // 🌟 INPUT: Recibe el ID desde el componente padre (si es Admin/Recepcionista)
  @Input() doctorIdExterno?: string;

  doctorIdActual: string = '';
  fechaSeleccionada: string = '';

  // Datos devueltos por la API
  bloques: any[] = [];
  doctorNombre: string = '';
  mensajeBackend: string = '';
  cargando: boolean = false;

  usuarioLogueado: any = null;


  mostrarModalAgendar: boolean = false;
  datosParaModal: any = null;

  mostrarModalReagendar: boolean = false;
  citaSeleccionadaParaReagendar: any = null;

  constructor(
    private calendarioService: CalendarioService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    // 1. Establecer fecha por defecto (HOY)
    const hoy = new Date();
    this.fechaSeleccionada = this.formatearFecha(hoy);

    // 2. Obtener quién está usando el sistema
    this.usuarioLogueado = this.loginService.obtenerUsuario();

    // 3. Determinar qué agenda cargar
    this.determinarDoctorYBuscar();
  }

  // Si el Admin cambia de doctor en el padre, esto lo detecta y recarga
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['doctorIdExterno'] && !changes['doctorIdExterno'].firstChange) {
      this.determinarDoctorYBuscar();
    }
  }

  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = ('0' + (fecha.getMonth() + 1)).slice(-2);
    const day = ('0' + fecha.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  determinarDoctorYBuscar(): void {
    // Si el usuario logueado es Doctor, siempre ve su propia agenda
    if (this.usuarioLogueado && this.usuarioLogueado.tipo === 'Doctor') {
      this.doctorIdActual = this.usuarioLogueado.id;
    }
    // Si no es doctor, usa el ID que mandó el Admin/Recepcionista
    else if (this.doctorIdExterno) {
      this.doctorIdActual = this.doctorIdExterno;
    }

    // Si ya tenemos un ID válido, disparamos la búsqueda
    if (this.doctorIdActual) {
      this.buscarDisponibilidad();
    }
  }

  buscarDisponibilidad(): void {
    this.cargando = true;
    this.mensajeBackend = '';
    this.bloques = [];
    this.doctorNombre = '';

    this.calendarioService.getDisponibilidadDoctor(this.doctorIdActual, this.fechaSeleccionada).subscribe({
      next: (res: any) => {
        this.bloques = res.bloques || [];
        this.doctorNombre = res.doctor || '';
        this.mensajeBackend = res.mensaje || '';
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al traer la disponibilidad:', err);
        this.mensajeBackend = 'Error al cargar la agenda. Verifica la conexión.';
        this.cargando = false;
      }
    });
  }
  seleccionarBloque(bloque: any): void {
    if (bloque.estado === 'disponible') {
      this.datosParaModal = {
        doctorId: this.doctorIdActual,
        fechaCita: this.fechaSeleccionada,
        horaInicio: this.limpiarHora(bloque.inicio),

        // 🌟 NUEVO: Le mandamos los límites exactos del bloque libre
        limiteMinimo: this.limpiarHora(bloque.inicio),
        limiteMaximo: this.limpiarHora(bloque.fin),

        telefono: ''
      };

      this.mostrarModalAgendar = true;
    }
  }

  abrirReagendarCita(bloque: any): void {
    this.citaSeleccionadaParaReagendar = {
      ...bloque,
      oldDoctorId: this.doctorIdActual,
      nombreDoctor: this.doctorNombre,
      fechaCita: this.fechaSeleccionada,
      horaInicio: this.limpiarHora(bloque.inicio),
      horaFin: this.limpiarHora(bloque.fin), 
      
      nombrePaciente: bloque.titulo
    };

    this.mostrarModalReagendar = true;
  }


  private limpiarHora(horaLegible: string): string {
    if (!horaLegible) return '';

    // Separa "10:00" de "AM"
    const [horaMinutos, modificador] = horaLegible.split(' ');
    let [horas, minutos] = horaMinutos.split(':');

    if (horas === '12') horas = '00';
    if (modificador === 'PM') horas = (parseInt(horas, 10) + 12).toString();

    return `${horas.padStart(2, '0')}:${minutos}`;
  }
}