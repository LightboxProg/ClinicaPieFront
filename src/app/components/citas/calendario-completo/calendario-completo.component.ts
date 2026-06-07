import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CalendarioService } from 'src/app/services/calendario.service'; 
import * as moment from 'moment';
import { RegendarCitasComponent } from '../regendar-citas/regendar-citas.component';

@Component({
  selector: 'app-calendario-completo',
  standalone: true,
  imports: [CommonModule, FormsModule, RegendarCitasComponent],
  templateUrl: './calendario-completo.component.html',
  styleUrls: ['./calendario-completo.component.scss']
})
export class CalendarioCompletoComponent implements OnInit {

  eventos: any[] = []; 
  cargandoEventos: boolean = false; 

  // Variables para controlar las fechas en la vista
  fechaInicio: string = '';
  fechaFin: string = '';

  mostrarModalReagendar: boolean = false;
  citaParaReagendar: any = null;

  constructor(private calendarioService: CalendarioService) {
    console.log('[CalendarioCompleto] Constructor ejecutado.');
  }

  ngOnInit(): void {
    console.log('[CalendarioCompleto] ngOnInit inicializado.');
    // 1. Configuramos por defecto la fecha de HOY
    const hoy = new Date();
    this.fechaInicio = this.formatearFecha(hoy);

    // 2. Por defecto, le sumamos 7 días para ver la semana completa
    const fin = new Date();
    fin.setDate(fin.getDate() + 7); 
    this.fechaFin = this.formatearFecha(fin);

    console.log('[CalendarioCompleto] Fechas por defecto:', this.fechaInicio, 'a', this.fechaFin);

    // 3. Cargamos los eventos con esas fechas iniciales
    this.cargarTodosLosEventos();
  }

  // Utilidad para convertir Date a formato 'YYYY-MM-DD' para los inputs
  formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = ('0' + (fecha.getMonth() + 1)).slice(-2);
    const day = ('0' + fecha.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  cargarTodosLosEventos(): void {
    console.log('[CalendarioCompleto] cargando todos los eventos...');
    this.cargandoEventos = true;

    // Convertimos a formato ISO de inicio de día y fin de día para Google
    const timeMinISO = this.fechaInicio ? `${this.fechaInicio}T00:00:00-06:00` : undefined;
    const timeMaxISO = this.fechaFin ? `${this.fechaFin}T23:59:59-06:00` : undefined;

    console.log('[CalendarioCompleto] Invocando servicio con parámetros ISO:', timeMinISO, timeMaxISO);

    // Mandamos las fechas al servicio
    this.calendarioService.getAllUsersEvents(timeMinISO, timeMaxISO).subscribe({
      next: (respuesta: any) => {
        console.log('[CalendarioCompleto] Respuesta recibida de eventos:', respuesta);
        this.eventos = respuesta.data || []; 
        this.cargandoEventos = false;
        console.log('[CalendarioCompleto] Carga de eventos finalizada. Cantidad:', this.eventos.length);
      },
      error: (error: any) => {
        console.error('[CalendarioCompleto] Error al traer los eventos:', error);
        this.cargandoEventos = false;
      }
    });
  }

  abrirReagendar(evento: any): void {
    // Extraemos las fechas del formato que manda Google Calendar
    const fechaInicioMom = moment(evento.start?.dateTime || evento.start?.date);
    const fechaFinMom = moment(evento.end?.dateTime || evento.end?.date);

    this.citaParaReagendar = {
      ...evento,
      oldDoctorId: evento.doctorId, 
      nombreDoctor: evento.nombreDoctor || 'Especialista',
      fechaCita: fechaInicioMom.format('YYYY-MM-DD'),
      horaInicio: fechaInicioMom.format('HH:mm'),
      horaFin: fechaFinMom.format('HH:mm'),
      nombrePaciente: evento.summary || 'Cita',
      _id: evento._id, 
      tipoContacto: evento.tipoContacto || 'paciente'
    };

    this.mostrarModalReagendar = true;
  }

}
