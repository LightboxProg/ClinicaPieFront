import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importamos los componentes de citas
import { CalendarioCompletoComponent } from 'src/app/components/citas/calendario-completo/calendario-completo.component';
import { CalendarioDoctorComponent } from 'src/app/components/citas/calendario-doctor/calendario-doctor.component';
import { AgendaSucursalesComponent } from 'src/app/components/citas/agenda-sucursales/agenda-sucursales.component';
import { CalendarioService } from 'src/app/services/calendario.service';
import { SucursalesService } from 'src/app/services/sucursales.service';

@Component({
  selector: 'app-calendario-page',
  standalone: true,
  imports: [CommonModule, CalendarioCompletoComponent, CalendarioDoctorComponent, AgendaSucursalesComponent],
  templateUrl: './calendario-page.component.html',
  styleUrls: ['./calendario-page.component.scss']
})
export class CalendarioPageComponent implements OnInit {

  vistaActual: 'general' | 'individual' | 'sucursales' = 'general';
  doctorIdSeleccionado: string = '';
  sucursalIdSeleccionada: string = '';

  doctores: any[] = [];
  sucursales: any[] = [];

  //  Inyectamos el servicio
  constructor(private calendarioService: CalendarioService, private sucursalesService: SucursalesService) { }

  ngOnInit(): void {
    this.cargarDoctores();
    this.cargarSucursales();
  }

  //  Función que trae los datos reales de Node.js
  cargarDoctores(): void {
    console.log('[CalendarioPage] Solicitando doctores activos...');
    this.calendarioService.getDoctoresActivos().subscribe({
      next: (data) => {
        console.log('[CalendarioPage] Doctores recibidos:', data);
        this.doctores = data || [];
      },
      error: (err) => {
        console.error('[CalendarioPage] Error al cargar doctores:', err);
        this.doctores = [];
      }
    });
  }
  cargarSucursales(): void {
    console.log('[CalendarioPage] Solicitando sucursales...');
    this.sucursalesService.obtenerSucursales().subscribe({
      next: (res) => {
        console.log('[CalendarioPage] Sucursales recibidas:', res);
        this.sucursales = res.data || res || [];
      },
      error: (err) => {
        console.error('[CalendarioPage] Error al cargar sucursales:', err);
        this.sucursales = [];
      }
    });
  }

  //  4. Actualizamos el tipo del parámetro para aceptar 'sucursales'
  cambiarVista(vista: 'general' | 'individual' | 'sucursales'): void {
    this.vistaActual = vista;
  }

  seleccionarSucursal(id: string): void {
    this.sucursalIdSeleccionada = id;
  }

  seleccionarDoctor(id: string): void {
    this.doctorIdSeleccionado = id;
  }
}