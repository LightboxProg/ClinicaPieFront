import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarioService } from 'src/app/services/calendario.service';
import { LoginService } from 'src/app/services/login.service';
import { ServiciosService } from 'src/app/services/servicios.service';
import { PromocionService, Promocion } from 'src/app/services/promocion.service';

@Component({
  selector: 'app-agenda-sucursales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda-sucursales.component.html',
  styleUrls: ['./agenda-sucursales.component.scss']
})
export class AgendaSucursalesComponent implements OnInit {

  // Si el admin quiere forzar una sucursal desde un componente padre
  @Input() sucursalIdExterno?: string; 

  sucursalIdActiva: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';
  
  sucursalesData: any[] = [];
  cargando: boolean = false;
  usuarioLogueado: any = null;

  constructor(
    private calendarioService: CalendarioService,
    private loginService: LoginService
  ) {}


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

  //  Calcula el Lunes y Domingo de la semana en curso
  establecerSemanaActual(): void {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 = Domingo, 1 = Lunes
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
    // Si es recepcionista, amarramos la búsqueda a su sucursal
    // Nota: Asegúrate de que el loginService guarde el 'sucursalId' del recepcionista en localStorage
    if (this.usuarioLogueado && this.usuarioLogueado.tipo === 'Recepcionista') {
      this.sucursalIdActiva = this.usuarioLogueado.sucursal || this.usuarioLogueado.sucursalId || ''; 
    } else if (this.sucursalIdExterno) {
      this.sucursalIdActiva = this.sucursalIdExterno;
    }

    this.cargarAgenda();
  }

  cargarAgenda(): void {
    this.cargando = true;
    
    // Si el ID está vacío (ej. Admin), Node.js traerá TODAS las sucursales
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
    
    // Suma la propiedad 'totalCitas' de cada día
    return dias.reduce((total, dia) => total + (dia.totalCitas || 0), 0);
  }
}