import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SucursalesService } from 'src/app/services/sucursales.service';
import { SwalService } from 'src/app/services/swal.service';

@Component({
  selector: 'app-lista-sucursales',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './lista-sucursales.component.html',
  styleUrls: ['./lista-sucursales.component.scss']
})
export class ListaSucursalesComponent implements OnInit {

  // Listas
  sucursales: any[] = [];
  sucursalesFiltradas: any[] = [];
  cargando: boolean = true;

  // Filtros
  filtroBusqueda: string = '';

  // Estado filtro activo
  filtroEstado: 'todos' | 'activo' | 'inactivo' = 'todos';

  constructor(
    private sucursalesService: SucursalesService,
    private swalService: SwalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarSucursales();
  }

  cargarSucursales() {
    this.cargando = true;
    this.sucursalesService.obtenerSucursales().subscribe({
      next: (res: any) => {
        this.sucursales = res.data || [];
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.cargando = false;
        this.swalService.error('Error', 'No se pudieron cargar las sucursales');
      }
    });
  }

  // ——— Filtros locales (rápidos, sin llamada al backend) ———
  aplicarFiltros() {
    const texto = this.filtroBusqueda.toLowerCase().trim();

    this.sucursalesFiltradas = this.sucursales.filter(suc => {
      // Filtro de texto: nombre o teléfono
      const coincideTexto = !texto
        || suc.nombre?.toLowerCase().includes(texto)
        || suc.telefono?.toLowerCase().includes(texto);

      // Filtro de estado
      const coincideEstado = this.filtroEstado === 'todos'
        || (this.filtroEstado === 'activo'   && suc.activo)
        || (this.filtroEstado === 'inactivo' && !suc.activo);

      return coincideTexto && coincideEstado;
    });
  }

  setFiltroEstado(estado: 'todos' | 'activo' | 'inactivo') {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.filtroBusqueda = '';
    this.filtroEstado = 'todos';
    this.aplicarFiltros();
  }

  // ——— Editar ———
  editarSucursal(id: string) {
    this.router.navigate(['/sucursales-formulario', id]);
  }

  // ——— Desactivar / Activar ———
  toggleEstado(sucursal: any) {
    const accion = sucursal.activo ? 'desactivar' : 'activar';
    const titulo = sucursal.activo ? '¿Desactivar sucursal?' : '¿Activar sucursal?';
    const texto  = sucursal.activo
      ? `"${sucursal.nombre}" ya no estará disponible para los pacientes.`
      : `"${sucursal.nombre}" volverá a estar visible.`;

    this.swalService.confirm(titulo, texto, sucursal.activo ? 'Sí, desactivar' : 'Sí, activar')
      .then((confirmado) => {
        if (!confirmado) return;

        const peticion = sucursal.activo
          ? this.sucursalesService.desactivarSucursal(sucursal._id)
          : this.sucursalesService.activarSucursal(sucursal._id);

        peticion.subscribe({
          next: () => {
            this.swalService.success(sucursal.activo ? 'Sucursal desactivada' : 'Sucursal activada');
            this.cargarSucursales();
          },
          error: (e) => this.swalService.error('Error', e.error?.message)
        });
      });
  }

  // ——— Eliminar permanentemente ———
  eliminarSucursal(sucursal: any) {
    this.swalService.confirm(
      '¿Eliminar permanentemente?',
      `Esta acción NO se puede deshacer. La sucursal "${sucursal.nombre}" será eliminada de la base de datos.`,
      'Sí, eliminar'
    ).then((confirmado) => {
      if (!confirmado) return;

      this.sucursalesService.eliminarSucursal(sucursal._id).subscribe({
        next: () => {
          this.swalService.success('Sucursal eliminada');
          this.cargarSucursales();
        },
        error: (e) => this.swalService.error('Error', e.error?.message)
      });
    });
  }

  // ——— Getters para la UI ———
  get totalActivas(): number {
    return this.sucursales.filter(s => s.activo).length;
  }

  get totalInactivas(): number {
    return this.sucursales.filter(s => !s.activo).length;
  }
}