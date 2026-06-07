import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiciosService } from 'src/app/services/servicios.service';
import { SwalService } from 'src/app/services/swal.service';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../modal/modal.component';
import { FormServicioComponent } from "../form-servicio/form-servicio.component";

@Component({
  selector: 'app-lista-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, FormServicioComponent],
  templateUrl: './lista-servicios.component.html',
  styleUrls: ['./lista-servicios.component.scss']
})
export class ListaServiciosComponent implements OnInit {
  servicios: any[] = [];
  serviciosFiltrados: any[] = [];

  isModalVisible: boolean = false;
  esEdicion: boolean = false;
  servicioSeleccionado: any = null;

  filtroEstado: string = 'todos';
  buscarTexto: string = '';

  totalServicios: number = 0;
  serviciosActivos: number = 0;
  serviciosInactivos: number = 0;

  constructor(
    private serviciosService: ServiciosService,
    private swalService: SwalService
  ) { }

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.serviciosService.obtenerServicios('true', 'true').subscribe({
      next: (response: any) => {
        if (response.success) {
          this.servicios = response.data;
          this.calcularEstadisticas();
          this.aplicarFiltros();
        } else {
          this.swalService.error('Error al cargar servicios', response.message);
        }
      },
      error: () => {
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

    if (this.filtroEstado === 'activos') {
      filtrados = filtrados.filter(s => s.activo === true);
    } else if (this.filtroEstado === 'inactivos') {
      filtrados = filtrados.filter(s => s.activo === false);
    }

    if (this.buscarTexto.trim() !== '') {
      const texto = this.buscarTexto.toLowerCase();
      filtrados = filtrados.filter(s =>
        s.nombre.toLowerCase().includes(texto) ||
        (s.descripcionCorta && s.descripcionCorta.toLowerCase().includes(texto))
      );
    }

    filtrados.sort((a, b) => {
      if (a.orden !== b.orden) return a.orden - b.orden;
      return a.nombre.localeCompare(b.nombre);
    });

    this.serviciosFiltrados = filtrados;
  }

  onFiltroEstadoChange(): void {
    this.aplicarFiltros();
  }

  onBuscarChange(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroEstado = 'todos';
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
      this.swalService.error('Error', 'El servicio seleccionado no tiene ID valido.');
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
      descripcionCorta: servicio.descripcionCorta || '',
      beneficios: servicio.beneficios || [],
      activo: servicio.activo !== undefined ? servicio.activo : true,
      orden: servicio.orden || 0,
      faqs: servicio.faqs || [],
      preciosPorSucursal: servicio.preciosPorSucursal || []
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
        descripcionCorta: servicio.descripcionCorta,
        beneficios: servicio.beneficios,
        activo: servicio.activo,
        orden: servicio.orden,
        faqs: servicio.faqs,
        preciosPorSucursal: servicio.preciosPorSucursal
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
        error: () => {
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
        descripcionCorta: servicio.descripcionCorta,
        beneficios: servicio.beneficios,
        activo: servicio.activo,
        orden: servicio.orden,
        faqs: servicio.faqs,
        preciosPorSucursal: servicio.preciosPorSucursal
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
        error: () => {
          this.swalService.error('Error', 'No se pudo crear el servicio.');
        }
      });
    }
  }

  desactivarServicio(id: string, nombre: string): void {
    this.swalService.confirm(
      'Desactivar servicio?',
      `El servicio "${nombre}" quedara inactivo y no se mostrara en la pagina. Podras reactivarlo despues.`,
      'Si, desactivar',
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
          error: () => {
            this.swalService.error('Error', 'No se pudo desactivar el servicio.');
          }
        });
      }
    });
  }

  inicializarServicios(): void {
    this.swalService.confirm(
      'Importar Servicios Iniciales',
      'Deseas importar los servicios por defecto de Clinica del Pie?',
      'Si, importar',
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
          error: () => {
            this.swalService.error('Error', 'No se pudieron importar los servicios iniciales.');
          }
        });
      }
    });
  }

  reactivarServicio(id: string): void {
    this.swalService.confirm('Reactivar', 'Deseas reactivar este servicio?').then((confirmed) => {
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
          error: () => {
            this.swalService.error('Error', 'No se pudo reactivar el servicio.');
          }
        });
      }
    });
  }

  eliminarPermanentemente(id: string, nombre: string): void {
    this.swalService.confirm(
      'Eliminar permanentemente?',
      `Esta accion eliminara para siempre el servicio "${nombre}". No podras recuperarlo.`,
      'Si, eliminar definitivamente',
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
          error: () => {
            this.swalService.error('Error', 'No se pudo eliminar el servicio.');
          }
        });
      }
    });
  }

  // Obtener nombres de sucursales para mostrar en la tabla
  getSucursalesPrecios(servicio: any): string {
    if (!servicio.preciosPorSucursal || servicio.preciosPorSucursal.length === 0) {
      return 'Precio base';
    }
    return servicio.preciosPorSucursal
      .map((p: any) => `${p.sucursal?.nombre || 'N/A'}: $${p.costo}`)
      .join(' | ');
  }
}