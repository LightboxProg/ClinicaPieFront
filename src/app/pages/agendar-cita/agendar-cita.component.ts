import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendar-cita.component.html',
  styleUrls: ['./agendar-cita.component.scss']
})
export class AgendarCitaComponent implements OnInit {
  
  paso: number = 1; // 1: Datos personales, 2: Servicio, 3: Horario, 4: Confirmación
  
  formData = {
    nombre: '',
    email: '',
    telefono: '',
    servicio: '',
    fecha: '',
    hora: ''
  };
  
  servicios = [
    { id: 1, nombre: 'Uña Encarnada', duracion: 30 },
    { id: 2, nombre: 'Pie Diabético', duracion: 60 },
    { id: 3, nombre: 'Hongos en Uñas', duracion: 45 },
    { id: 4, nombre: 'Callos y Verrugas', duracion: 30 },
    { id: 5, nombre: 'Pedicura Médica', duracion: 50 },
    { id: 6, nombre: 'Evaluación Inicial', duracion: 45 }
  ];
  
  horarios = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];
  
  fechaMinima: string = '';
  
  mensajeExito: string = '';
  cargando: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Establecer fecha mínima (hoy)
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
  }

  siguientePaso(): void {
    if (this.validarPasoActual()) {
      this.paso++;
    }
  }

  pasoAnterior(): void {
    if (this.paso > 1) {
      this.paso--;
    }
  }

  validarPasoActual(): boolean {
    switch(this.paso) {
      case 1:
        return !!this.formData.nombre && !!this.formData.email && !!this.formData.telefono;
      case 2:
        return this.formData.servicio !== '';
      case 3:
        return !!this.formData.fecha && !!this.formData.hora;
      default:
        return true;
    }
  }

  confirmarCita(): void {
    if (!this.validarFormularioCompleto()) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    this.cargando = true;
    // Simular envío
    setTimeout(() => {
      this.mensajeExito = '¡Cita agendada exitosamente! Pronto recibirás una confirmación por email.';
      this.cargando = false;
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
    }, 1500);
  }

  validarFormularioCompleto(): boolean {
    return !!this.formData.nombre && 
           !!this.formData.email && 
           !!this.formData.telefono && 
           !!this.formData.servicio && 
           !!this.formData.fecha && 
           !!this.formData.hora;
  }

  obtenerNombreServicio(): string {
    return this.servicios.find(s => s.id === parseInt(this.formData.servicio))?.nombre || '';
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}
