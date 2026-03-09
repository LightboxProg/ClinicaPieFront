import { Component, OnInit } from '@angular/core';
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
  
  cargando: boolean = false;
  guardando: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  // Plantilla base para los 7 días de la semana
  semana: DiaHorario[] = [];
  nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  constructor(
    private horariosService: HorariosService,
    private calendarioService: CalendarioService
  ) {}

  ngOnInit(): void {
    this.cargarDoctores();
    this.inicializarSemanaVacia();
  }

  // Prepara la estructura de los 7 días apagados por defecto
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

  // Se ejecuta al cambiar el selector de doctor. Descarga su horario si ya existe.
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
        // Si el error es 404, significa que es un doctor nuevo sin horario, lo cual es normal.
        if (err.status !== 404) {
          console.error('Error al traer horario:', err);
        }
      }
    });
  }

  // Mezcla la plantilla vacía con los datos reales que vienen de Node.js
  mapearHorarioExistente(horarioDb: any[]): void {
    this.inicializarSemanaVacia(); // Reseteamos primero
    
    horarioDb.forEach(diaDb => {
      const diaLocal = this.semana.find(d => d.diaSemana === diaDb.diaSemana);
      if (diaLocal) {
        diaLocal.activo = diaDb.activo;
        // Clonamos los turnos para no alterar la referencia original
        diaLocal.turnos = diaDb.turnos ? JSON.parse(JSON.stringify(diaDb.turnos)) : [];
      }
    });
  }

  // Agrega un bloque de entrada/salida vacío a un día específico
  agregarTurno(dia: DiaHorario): void {
    dia.turnos.push({ horaInicio: '', horaFin: '' });
    dia.activo = true; // Si agrega turno, asumimos que el día es activo
  }

  // Elimina un bloque de entrada/salida de un día
  eliminarTurno(dia: DiaHorario, index: number): void {
    dia.turnos.splice(index, 1);
    if (dia.turnos.length === 0) {
      dia.activo = false; // Si se queda sin turnos, apagamos el día
    }
  }

  // Limpia turnos vacíos e inválidos antes de enviar a Node.js
  guardarConfiguracion(): void {
    if (!this.doctorSeleccionado) {
      this.mensajeError = 'Selecciona un especialista primero.';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    // Filtramos y limpiamos los datos antes de enviarlos
    const payload = this.semana.map(dia => {
      // Si está activo, filtramos turnos que no estén llenos
      const turnosValidos = dia.activo ? dia.turnos.filter(t => t.horaInicio && t.horaFin) : [];
      
      return {
        diaSemana: dia.diaSemana,
        activo: dia.activo && turnosValidos.length > 0, // Doble validación
        turnos: turnosValidos
      };
    });

    this.horariosService.guardarHorario(this.doctorSeleccionado, payload).subscribe({
      next: (res) => {
        this.guardando = false;
        this.mensajeExito = 'Horario guardado correctamente.';
        // Recargamos visualmente para mostrar los datos limpios
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