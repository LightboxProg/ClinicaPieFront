import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiciosService } from 'src/app/services/servicios.service';
import { CategoriasService } from 'src/app/services/categorias.service';
import { SwalService } from 'src/app/services/swal.service';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../modal/modal.component';
import { FormServicioComponent } from "../form-servicio/form-servicio.component";

@Component({
  selector: 'app-lista-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, FormsModule, FormServicioComponent],
  templateUrl: './lista-servicios.component.html',
  styleUrls: ['./lista-servicios.component.scss']
})
export class ListaServiciosComponent implements OnInit {
  servicios: any[] = [];
  serviciosFiltrados: any[] = [];
  categoriasDisponibles: any[] = [];

  isModalVisible: boolean = false;
  esEdicion: boolean = false;
  servicioSeleccionado: any = null;

  // Variables para filtros
  filtroEstado: string = 'todos'; // 'activos', 'inactivos', 'todos'
  filtroCategoria: string = '';
  buscarTexto: string = '';

  // Estadísticas
  totalServicios: number = 0;
  serviciosActivos: number = 0;
  serviciosInactivos: number = 0;

  constructor(
    private serviciosService: ServiciosService,
    private categoriasService: CategoriasService,
    private swalService: SwalService
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarServicios();
  }

  cargarCategorias(): void {
    this.categoriasService.obtenerCategorias(true).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.categoriasDisponibles = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  cargarServicios(): void {
    this.serviciosService.obtenerServicios(undefined, 'true', 'true').subscribe({
      next: (response: any) => {
        if (response.success) {
          this.servicios = response.data;
          this.calcularEstadisticas();
          this.aplicarFiltros();
        } else {
          this.swalService.error('Error al cargar servicios', response.message);
        }
      },
      error: (error) => {
        this.swalService.error('Error', 'No se pudo cargar la lista de servicios.');
      }
    });
  }

  calcularEstadisticas(): void {
    this.totalServicios = this.servicios.length;
    this.serviciosActivos = this.servicios.filter(s => s.activo === true).length;
    this.serviciosInactivos = this.servicios.filter(s => s.activo === false).length;
  }

  aplicarFiltros(): void {
    let filtrados = [...this.servicios];

    // Filtrar por estado
    if (this.filtroEstado === 'activos') {
      filtrados = filtrados.filter(s => s.activo === true);
    } else if (this.filtroEstado === 'inactivos') {
      filtrados = filtrados.filter(s => s.activo === false);
    }

    // Filtrar por categoría
    if (this.filtroCategoria) {
      filtrados = filtrados.filter(s => s.categoria?._id === this.filtroCategoria);
    }

    // Filtrar por texto de búsqueda
    if (this.buscarTexto.trim() !== '') {
      const texto = this.buscarTexto.toLowerCase();
      filtrados = filtrados.filter(s =>
        s.nombre.toLowerCase().includes(texto) ||
        (s.descripcionCorta && s.descripcionCorta.toLowerCase().includes(texto)) ||
        (s.categoria?.nombre && s.categoria.nombre.toLowerCase().includes(texto))
      );
    }

    // Ordenar por categoría, orden y nombre
    filtrados.sort((a, b) => {
      // Primero por categoría
      const catA = a.categoria?.nombre || '';
      const catB = b.categoria?.nombre || '';
      if (catA !== catB) return catA.localeCompare(catB);

      // Luego por orden
      if (a.orden !== b.orden) return a.orden - b.orden;

      // Finalmente por nombre
      return a.nombre.localeCompare(b.nombre);
    });

    this.serviciosFiltrados = filtrados;
  }

  onFiltroEstadoChange(): void {
    this.aplicarFiltros();
  }

  onFiltroCategoriaChange(): void {
    this.aplicarFiltros();
  }

  onBuscarChange(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroEstado = 'todos';
    this.filtroCategoria = '';
    this.buscarTexto = '';
    this.aplicarFiltros();
  }

  abrirModal(): void {
    this.isModalVisible = true;
  }

  cerrarModal(): void {
    this.isModalVisible = false;
    this.servicioSeleccionado = null;
    this.esEdicion = false;
  }

  editarServicio(servicio: any): void {
    if (!servicio._id) {
      this.swalService.error('Error', 'El servicio seleccionado no tiene ID válido.');
      return;
    }

    this.servicioSeleccionado = {
      _id: servicio._id,
      nombre: servicio.nombre,
      duracion: servicio.duracion || 45,
      costo: servicio.costo,
      costoPaquete: servicio.costoPaquete,
      tieneSesiones: servicio.tieneSesiones || false,
      sesiones: servicio.sesiones || { numero: 1, descripcion: '' },
      categoria: servicio.categoria?._id || servicio.categoria,
      descripcionCorta: servicio.descripcionCorta || '',
      beneficios: servicio.beneficios || [],
      activo: servicio.activo !== undefined ? servicio.activo : true,
      orden: servicio.orden || 0,
      faqs: servicio.faqs || []
    };

    this.esEdicion = true;
    this.abrirModal();
  }

  onGuardarServicio(servicio: any): void {
    if (this.esEdicion) {
      const servicioId = servicio._id;
      const datosParaActualizar = {
        nombre: servicio.nombre,
        duracion: servicio.duracion,
        costo: servicio.costo,
        costoPaquete: servicio.costoPaquete,
        tieneSesiones: servicio.tieneSesiones,
        sesiones: servicio.sesiones,
        categoria: servicio.categoria,
        descripcionCorta: servicio.descripcionCorta,
        beneficios: servicio.beneficios,
        activo: servicio.activo,
        orden: servicio.orden,
        faqs: servicio.faqs
      };

      this.serviciosService.actualizarServicio(servicioId, datosParaActualizar).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.swalService.success('Servicio actualizado', response.message);
            this.cargarServicios();
            this.cerrarModal();
          } else {
            this.swalService.error('Error', response.message);
          }
        },
        error: (error) => {
          console.error('Error en actualización:', error);
          this.swalService.error('Error', 'No se pudo actualizar el servicio.');
        }
      });
    } else {
      const datosParaCrear = {
        nombre: servicio.nombre,
        duracion: servicio.duracion,
        costo: servicio.costo,
        costoPaquete: servicio.costoPaquete,
        tieneSesiones: servicio.tieneSesiones,
        sesiones: servicio.sesiones,
        categoria: servicio.categoria,
        descripcionCorta: servicio.descripcionCorta,
        beneficios: servicio.beneficios,
        activo: servicio.activo,
        orden: servicio.orden,
        faqs: servicio.faqs
      };

      this.serviciosService.crearServicio(datosParaCrear).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.swalService.success('Servicio creado', response.message);
            this.cargarServicios();
            this.cerrarModal();
          } else {
            this.swalService.error('Error', response.message);
          }
        },
        error: (error) => {
          console.error('Error en creación:', error);
          this.swalService.error('Error', 'No se pudo crear el servicio.');
        }
      });
    }
  }

  desactivarServicio(id: string, nombre: string): void {
    this.swalService.confirm(
      '¿Desactivar servicio?',
      `El servicio "${nombre}" quedará inactivo y no se mostrará en la página. Podrás reactivarlo después.`,
      'Sí, desactivar',
      'Cancelar'
    ).then((confirmed) => {
      if (confirmed) {
        this.serviciosService.eliminarServicio(id, false).subscribe({
          next: (response: any) => {
            if (response.success) {
              this.swalService.success('Servicio desactivado', response.message);
              this.cargarServicios();
            } else {
              this.swalService.error('Error', response.message);
            }
          },
          error: (error) => {
            console.error('Error al desactivar:', error);
            this.swalService.error('Error', 'No se pudo desactivar el servicio.');
          }
        });
      }
    });
  }

  inicializarServicios(): void {
    this.swalService.confirm(
      'Importar Servicios Iniciales',
      '¿Deseas importar los servicios por defecto? Esto agregará servicios de ejemplo para todas las categorías disponibles.',
      'Sí, importar',
      'Cancelar'
    ).then((confirmed) => {
      if (confirmed) {
        this.serviciosService.importarServiciosIniciales().subscribe({
          next: (response: any) => {
            if (response.success) {
              this.swalService.success('Servicios importados', `Se importaron ${response.count} servicios correctamente.`);
              this.cargarServicios();
            } else {
              this.swalService.error('Error', response.message);
            }
          },
          error: (error) => {
            this.swalService.error('Error', 'No se pudieron importar los servicios iniciales.');
          }
        });
      }
    });
  }

  reactivarServicio(id: string): void {
    this.swalService.confirm('Reactivar', '¿Deseas reactivar este servicio?').then((confirmed) => {
      if (confirmed) {
        const datos = { activo: true };
        this.serviciosService.actualizarServicio(id, datos).subscribe({
          next: (response: any) => {
            if (response.success) {
              this.swalService.success('Servicio reactivado', response.message);
              this.cargarServicios();
            } else {
              this.swalService.error('Error', response.message);
            }
          },
          error: (error) => {
            this.swalService.error('Error', 'No se pudo reactivar el servicio.');
          }
        });
      }
    });
  }

  eliminarPermanentemente(id: string, nombre: string): void {
    this.swalService.confirm(
      '¿Eliminar permanentemente?',
      `Esta acción eliminará para siempre el servicio "${nombre}". No podrás recuperarlo.`,
      'Sí, eliminar definitivamente',
      'Cancelar'
    ).then((confirmed) => {
      if (confirmed) {
        this.serviciosService.eliminarServicio(id, true).subscribe({
          next: (response: any) => {
            if (response.success) {
              this.swalService.success('Eliminado', response.message);
              this.cargarServicios();
            } else {
              this.swalService.error('Error', response.message);
            }
          },
          error: (error) => {
            console.error('Error al eliminar permanentemente:', error);
            this.swalService.error('Error', 'No se pudo eliminar el servicio.');
          }
        });
      }
    });
  }
}