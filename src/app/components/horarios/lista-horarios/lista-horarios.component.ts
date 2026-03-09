import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorariosService } from 'src/app/services/horarios.service';
import { HorariosDoctorComponent } from '../horarios-doctor/horarios-doctor.component';

@Component({
  selector: 'app-lista-horarios',
  standalone: true,
  // Importamos el componente hijo aqui para poder usar su etiqueta HTML
  imports: [CommonModule, HorariosDoctorComponent],
  templateUrl: './lista-horarios.component.html',
  styleUrls: ['./lista-horarios.component.scss']
})
export class ListaHorariosComponent implements OnInit {

  listaHorarios: any[] = [];
  cargando: boolean = false;
  
  // Variable para controlar que doctor estamos viendo en el componente hijo
  horarioSeleccionado: any = null;

  constructor(private horariosService: HorariosService) {}

  ngOnInit(): void {
    this.cargarTodosLosHorarios();
  }

  // Llama al endpoint /todos que creamos en Node.js
  cargarTodosLosHorarios(): void {
    this.cargando = true;
    this.horariosService.obtenerTodosLosHorarios().subscribe({
      next: (res) => {
        // Guardamos el arreglo agrupado que nos manda el backend
        this.listaHorarios = res.horarios || [];
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar la lista de horarios:', err);
        this.cargando = false;
      }
    });
  }

  // Oculta la lista y le pasa los datos al componente hijo
  abrirEditor(horarioDoctor: any): void {
    this.horarioSeleccionado = horarioDoctor;
  }

  // Se ejecuta cuando el hijo emite el evento 'cerrarVista'
  cerrarEditor(): void {
    this.horarioSeleccionado = null;
    // Opcional: volver a cargar la lista por si hubo cambios
    // this.cargarTodosLosHorarios(); 
  }

  // Cuenta cuantos dias de la semana trabaja este doctor para mostrar un resumen
  contarDiasActivos(diasConfigurados: any[]): number {
    if (!diasConfigurados) return 0;
    return diasConfigurados.filter(dia => dia.activo).length;
  }
}