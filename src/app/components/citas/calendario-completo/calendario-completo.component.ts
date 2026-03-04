import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CalendarioService } from 'src/app/services/calendario.service'; 

@Component({
  selector: 'app-calendario-completo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calendario-completo.component.html',
  styleUrls: ['./calendario-completo.component.scss']
})
export class CalendarioCompletoComponent implements OnInit {

  eventos: any[] = []; 
  cargandoEventos: boolean = false; 

  // Variables para controlar las fechas en la vista
  fechaInicio: string = '';
  fechaFin: string = '';

  constructor(private calendarioService: CalendarioService) {}

  ngOnInit(): void {
    // 1. Configuramos por defecto la fecha de HOY
    const hoy = new Date();
    this.fechaInicio = this.formatearFecha(hoy);

    // 2. Por defecto, le sumamos 7 días para ver la semana completa
    const fin = new Date();
    fin.setDate(fin.getDate() + 7); 
    this.fechaFin = this.formatearFecha(fin);

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
    this.cargandoEventos = true;

    // Convertimos a formato ISO de inicio de día y fin de día para Google
    const timeMinISO = this.fechaInicio ? `${this.fechaInicio}T00:00:00-06:00` : undefined;
    const timeMaxISO = this.fechaFin ? `${this.fechaFin}T23:59:59-06:00` : undefined;

    // Mandamos las fechas al servicio
    this.calendarioService.getAllUsersEvents(timeMinISO, timeMaxISO).subscribe({
      next: (respuesta: any) => {
        this.eventos = respuesta.data || []; 
        this.cargandoEventos = false;
      },
      error: (error: any) => {
        console.error('Error al traer los eventos:', error);
        this.cargandoEventos = false;
      }
    });
  }
}
