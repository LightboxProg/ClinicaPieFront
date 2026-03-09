import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { HorariosService } from 'src/app/services/horarios.service';

@Component({
  selector: 'app-horarios-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './horarios-doctor.component.html',
  styleUrls: ['./horarios-doctor.component.scss']
})
export class HorariosDoctorComponent implements OnInit {
  
  @Input() datosHorario: any = null;
  @Output() cerrarVista = new EventEmitter<void>();

  diasEditables: any[] = []; 
  guardando: boolean = false;
  mensaje: string = '';

  constructor(private horariosService: HorariosService) {}

  ngOnInit(): void {
    this.prepararDiasSeguros();
  }

  // Clona los datos y rellena los 7 dias de la semana
  prepararDiasSeguros(): void {
    if (!this.datosHorario || !this.datosHorario.diasConfigurados) return;
    
    // 1.  clon  para no alterar los datos del Padre
    const diasClonados = JSON.parse(JSON.stringify(this.datosHorario.diasConfigurados));
    
    const diasCompletos = [];
    
    // 2. Recorremos del 0 (Domingo) al 6 (Sabado)
    for (let i = 0; i < 7; i++) {
      const diaExistente = diasClonados.find((d: any) => d.diaSemana === i);
      
      if (diaExistente) {
        diaExistente.turnos = diaExistente.turnos || [];
        diasCompletos.push(diaExistente);
      } else {
        diasCompletos.push({ diaSemana: i, activo: false, turnos: [] });
      }
    }
    
    this.diasEditables = diasCompletos;
  }

  volver(): void {
    this.cerrarVista.emit();
  }

  obtenerNombreDia(index: number): string {
    const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return nombresDias[index] || 'Día desconocido';
  }

  agregarTurno(dia: any): void {
    if (!dia.turnos) dia.turnos = [];
    dia.turnos.push({ horaInicio: '', horaFin: '' });
    dia.activo = true;
  }

  eliminarTurno(dia: any, index: number): void {
    dia.turnos.splice(index, 1);
    if (dia.turnos.length === 0) {
      dia.activo = false;
    }
  }

  guardarCambios(): void {
    this.guardando = true;
    this.mensaje = '';

    const idDoctor = this.datosHorario.doctor._id;

    const payload = this.diasEditables.map((dia: any) => {
      const turnosValidos = dia.activo && dia.turnos ? dia.turnos.filter((t: any) => t.horaInicio && t.horaFin) : [];
      return {
        diaSemana: dia.diaSemana,
        activo: dia.activo && turnosValidos.length > 0,
        turnos: turnosValidos
      };
    });

    this.horariosService.guardarHorario(idDoctor, payload).subscribe({
      next: (res) => {
        this.guardando = false;
        this.mensaje = 'Horario actualizado correctamente.';
        setTimeout(() => {
          this.mensaje = '';
          this.cerrarVista.emit();
        }, 1500);
      },
      error: (err) => {
        this.guardando = false;
        this.mensaje = 'Error al actualizar el horario.';
        console.error(err);
      }
    });
  }
}