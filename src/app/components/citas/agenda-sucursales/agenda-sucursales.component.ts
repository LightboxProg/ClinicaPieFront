import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarioService } from 'src/app/services/calendario.service';
import { LoginService } from 'src/app/services/login.service';
import * as moment from 'moment';
import { AgendarCitaComponent } from '../agendar-cita/agendar-cita.component';
import { RegendarCitasComponent } from '../regendar-citas/regendar-citas.component';
import { BloqueoSucursalComponent } from '../bloqueo-sucursal/bloqueo-sucursal.component';

@Component({
  selector: 'app-agenda-sucursales',
  standalone: true,
  imports: [CommonModule, FormsModule, AgendarCitaComponent, RegendarCitasComponent, BloqueoSucursalComponent],
  templateUrl: './agenda-sucursales.component.html',
  styleUrls: ['./agenda-sucursales.component.scss']
})
export class AgendaSucursalesComponent implements OnInit, OnChanges {

  @Input() sucursalIdExterno?: string;
  mostrarModalBloqueo: boolean = false;
  sucursalParaBloqueo: string = '';

  sucursalIdActiva: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  sucursalesData: any[] = [];
  cargando: boolean = false;
  usuarioLogueado: any = null;

  // Control de modales
  mostrarModalAgendar: boolean = false;
  datosParaAgendar: any = null;

  mostrarModalReagendar: boolean = false;
  citaParaReagendar: any = null;

  constructor(
    private calendarioService: CalendarioService,
    private loginService: LoginService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sucursalIdExterno'] && !changes['sucursalIdExterno'].firstChange) {
      this.determinarSucursalYBuscar();
    }
  }

  ngOnInit(): void {
    this.usuarioLogueado = this.loginService.obtenerUsuario();
    this.establecerSemanaActual();
    this.determinarSucursalYBuscar();
  }

  establecerSemanaActual(): void {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diffLunes = hoy.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);

    const lunes = new Date(hoy.setDate(diffLunes));
    const domingo = new Date(lunes.getTime());
    domingo.setDate(lunes.getDate() + 6);

    this.fechaInicio = this.formatearFecha(lunes);
    this.fechaFin = this.formatearFecha(domingo);
  }

  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = ('0' + (fecha.getMonth() + 1)).slice(-2);
    const day = ('0' + fecha.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  determinarSucursalYBuscar(): void {
    if (this.usuarioLogueado && this.usuarioLogueado.tipo === 'Recepcionista') {
      this.sucursalIdActiva = this.usuarioLogueado.sucursal || this.usuarioLogueado.sucursalId || '';
    } else if (this.sucursalIdExterno) {
      this.sucursalIdActiva = this.sucursalIdExterno;
    }

    this.cargarAgenda();
  }

  cargarAgenda(): void {
    this.cargando = true;

    this.calendarioService.getCitasPorSucursalSemana(this.sucursalIdActiva, this.fechaInicio, this.fechaFin).subscribe({
      next: (res: any) => {
        this.sucursalesData = res.data || [];
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar la agenda de la sucursal', err);
        this.cargando = false;
      }
    });
  }

  totalCitasSemana(dias: any[]): number {
    if (!dias || dias.length === 0) return 0;
    return dias.reduce((total, dia) => total + (dia.totalCitas || 0), 0);
  }

  // Prepara el formulario vacio para agendar un nuevo paciente
  abrirAgendarGlobal(): void {
    this.datosParaAgendar = {
      doctorId: '',
      fechaCita: this.fechaInicio,
      horaInicio: '',
      telefono: ''
    };
    this.mostrarModalAgendar = true;
  }

  // Extrae los datos del doctor padre y del dia padre para asignarlos a la cita hija
  abrirReagendar(cita: any, doctor: any, fechaDia: string): void {
    this.citaParaReagendar = {
      ...cita,
      oldDoctorId: doctor.idUsuario || doctor.doctorId || doctor._id || cita.doctorId,
      nombreDoctor: doctor.nombreDoctor,
      fechaCita: fechaDia,
      horaInicio: this.limpiarHora(cita.inicio),
      horaFin: this.limpiarHora(cita.fin),
      nombrePaciente: cita.titulo,
      _id: cita._id,
      tipoContacto: cita.tipoContacto || 'paciente'
    };
    this.mostrarModalReagendar = true;
  }

  // Convierte "02:30 PM" a "14:30" para que el input type="time" de Angular lo entienda
  private limpiarHora(horaLegible: string): string {
    if (!horaLegible) return '';
    if (!horaLegible.includes(' ')) return horaLegible;
    const [horaMinutos, modificador] = horaLegible.split(' ');
    let [horas, minutos] = horaMinutos.split(':');
    if (horas === '12') horas = '00';
    if (modificador === 'PM') horas = (parseInt(horas, 10) + 12).toString();
    return `${horas.padStart(2, '0')}:${minutos}`;
  }

  abrirBloqueoSucursal(sucursalId: string) {
    this.sucursalParaBloqueo = sucursalId;
    this.mostrarModalBloqueo = true;
  }


}