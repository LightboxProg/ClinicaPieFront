import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Promocion, PromocionService } from 'src/app/services/promocion.service';
import { CategoriasService } from 'src/app/services/categorias.service';
import { ServiciosService } from 'src/app/services/servicios.service';
import { SucursalesService } from 'src/app/services/sucursales.service';
import { SwalService } from 'src/app/services/swal.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-promociones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-promociones.component.html',
  styleUrls: ['./lista-promociones.component.scss']
})
export class ListaPromocionesComponent implements OnInit {
  promociones: Promocion[] = [];
  categorias: any[] = [];
  servicios: any[] = [];
  sucursales: any[] = [];

  filtroActiva = '';
  filtroVigente = '';
  filtroServicio = '';
  filtroCategoria = '';
  filtroSucursal = '';

  constructor(
    private promocionService: PromocionService,
    private categoriasService: CategoriasService,
    private serviciosService: ServiciosService,
    private sucursalesService: SucursalesService,
    private swal: SwalService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarCatalogos();
    this.cargarPromociones();
  }

  cargarCatalogos(): void {
    this.categoriasService.obtenerCategorias().subscribe(res => {
      this.categorias = res.data || res;
    });
    this.serviciosService.obtenerServicios().subscribe(res => {
      this.servicios = res.data || res;
    });
    this.sucursalesService.obtenerSucursales().subscribe(res => {
      this.sucursales = res.data || res;
    });
  }

  cargarPromociones(): void {
    const filtros: any = {};
    if (this.filtroActiva !== '') filtros.activa = this.filtroActiva === 'true';
    if (this.filtroVigente !== '') filtros.vigente = this.filtroVigente === 'true';
    if (this.filtroServicio) filtros.servicio = this.filtroServicio;
    if (this.filtroCategoria) filtros.categoria = this.filtroCategoria;
    if (this.filtroSucursal) filtros.sucursal = this.filtroSucursal;

    this.promocionService.obtenerPromociones(filtros).subscribe({
      next: (res) => {
        this.promociones = res.data;
      },
      error: (err) => {
        this.swal.error('Error al cargar promociones');
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarPromociones();
  }

  limpiarFiltros(): void {
    this.filtroActiva = '';
    this.filtroVigente = '';
    this.filtroServicio = '';
    this.filtroCategoria = '';
    this.filtroSucursal = '';
    this.cargarPromociones();
  }

  nuevaPromocion(): void {
    this.router.navigate(['/promocion-form']);
  }

  editarPromocion(id: string): void {
    this.router.navigate(['/promocion-form', id]);
  }

  desactivarPromocion(id: string): void {
    this.swal.confirm('¿Desactivar promoción?', 'La promoción dejará de ser visible').then(ok => {
      if (ok) {
        this.promocionService.eliminarPromocion(id).subscribe({
          next: () => {
            this.swal.success('Promoción desactivada');
            this.cargarPromociones();
          },
          error: () => this.swal.error('Error al desactivar')
        });
      }
    });
  }

  activarPromocion(id: string): void {
    this.promocionService.activarPromocion(id).subscribe({
      next: () => {
        this.swal.success('Promoción activada');
        this.cargarPromociones();
      },
      error: () => this.swal.error('Error al activar')
    });
  }

  eliminarPromocion(id: string): void {
    this.swal.confirm(
      '¿Eliminar permanentemente?',
      'Esta acción no se puede deshacer. La promoción será borrada de la base de datos.'
    ).then(ok => {
      if (ok) {
        this.promocionService.eliminarPromocion(id, true).subscribe({
          next: () => {
            this.swal.success('Promoción eliminada permanentemente');
            this.cargarPromociones();
          },
          error: () => this.swal.error('Error al eliminar')
        });
      }
    });
  }

  nombresServicios(servicios: any[]): string {
    return servicios?.map(s => s.nombre).join(', ') || '';
  }

  importarPromocionesIniciales(): void {
    this.swal.confirm(
      'Importar promociones iniciales',
      '¿Deseas crear las promociones por defecto? Se asignarán aleatoriamente a las sucursales existentes.'
    ).then(confirmado => {
      if (confirmado) {
        this.promocionService.importarPromocionesIniciales().subscribe({
          next: (res) => {
            this.swal.success(`Se importaron ${res.count} promociones`);
            this.cargarPromociones(); // recargar la lista
          },
          error: (err) => {
            this.swal.error('Error al importar promociones');
          }
        });
      }
    });
  }

  obtenerNombreServicio(servicio: any): string {
    if (!servicio) return '';
    return typeof servicio === 'object' ? servicio.nombre : this.servicios.find(s => s._id === servicio)?.nombre || servicio;
  }

}