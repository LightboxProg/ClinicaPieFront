import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoriasService } from 'src/app/services/categorias.service';
import { SwalService } from 'src/app/services/swal.service';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../modal/modal.component';
import { FormCategoriaComponent } from '../form-categoria/form-categoria.component';

@Component({
  selector: 'app-lista-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, FormCategoriaComponent],
  templateUrl: './lista-categorias.component.html',
  styleUrls: ['./lista-categorias.component.scss']
})
export class ListaCategoriasComponent implements OnInit {
  categorias: any[] = [];
  categoriasFiltradas: any[] = [];
  isModalVisible: boolean = false;
  esEdicion: boolean = false;
  categoriaSeleccionada: any = null;
  
  // Variables para filtros
  filtroEstado: string = 'todas'; // 'activas', 'inactivas', 'todas'
  buscarTexto: string = '';
  
  // Estadísticas
  totalCategorias: number = 0;
  categoriasActivas: number = 0;
  categoriasInactivas: number = 0;

  constructor(
    private categoriasService: CategoriasService,
    private swalService: SwalService
  ) { }

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    // Cargar todas las categorías (activas e inactivas)
    this.categoriasService.obtenerCategorias(true).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.categorias = response.data;
          this.calcularEstadisticas();
          this.aplicarFiltros();
        } else {
          this.swalService.error('Error al cargar categorías', response.message);
        }
      },
      error: (error) => {
        this.swalService.error('Error', 'No se pudo cargar la lista de categorías.');
      }
    });
  }

  calcularEstadisticas(): void {
    this.totalCategorias = this.categorias.length;
    this.categoriasActivas = this.categorias.filter(c => c.activa === true).length;
    this.categoriasInactivas = this.categorias.filter(c => c.activa === false).length;
  }

  aplicarFiltros(): void {
    let filtradas = [...this.categorias];
    
    // Filtrar por estado
    if (this.filtroEstado === 'activas') {
      filtradas = filtradas.filter(c => c.activa === true);
    } else if (this.filtroEstado === 'inactivas') {
      filtradas = filtradas.filter(c => c.activa === false);
    }
    
    // Filtrar por texto de búsqueda
    if (this.buscarTexto.trim() !== '') {
      const texto = this.buscarTexto.toLowerCase();
      filtradas = filtradas.filter(c => 
        c.nombre.toLowerCase().includes(texto) ||
        (c.descripcion && c.descripcion.toLowerCase().includes(texto))
      );
    }
    
    // Ordenar por orden y nombre
    filtradas.sort((a, b) => {
      if (a.orden !== b.orden) return a.orden - b.orden;
      return a.nombre.localeCompare(b.nombre);
    });
    
    this.categoriasFiltradas = filtradas;
  }

  onFiltroEstadoChange(): void {
    this.aplicarFiltros();
  }

  onBuscarChange(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroEstado = 'todas';
    this.buscarTexto = '';
    this.aplicarFiltros();
  }

  abrirModal(): void {
    this.isModalVisible = true;
  }

  cerrarModal(): void {
    this.isModalVisible = false;
    this.categoriaSeleccionada = null;
    this.esEdicion = false;
  }

  editarCategoria(categoria: any): void {
    console.log('Editando categoría:', categoria);
    
    if (!categoria._id) {
      this.swalService.error('Error', 'La categoría seleccionada no tiene ID válido.');
      return;
    }
    
    this.categoriaSeleccionada = {
      _id: categoria._id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      orden: categoria.orden || 0,
      activa: categoria.activa !== undefined ? categoria.activa : true
    };
    
    this.esEdicion = true;
    this.abrirModal();
  }

  onGuardarCategoria(categoria: any): void {
    if (this.esEdicion) {
      const categoriaId = categoria._id;
      const datosParaActualizar = {
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        orden: categoria.orden,
        activa: categoria.activa
      };
      
      this.categoriasService.actualizarCategoria(categoriaId, datosParaActualizar).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.swalService.success('Categoría actualizada', response.message);
            this.cargarCategorias();
            this.cerrarModal();
          } else {
            this.swalService.error('Error', response.message);
          }
        },
        error: (error) => {
          console.error('Error en actualización:', error);
          this.swalService.error('Error', 'No se pudo actualizar la categoría.');
        }
      });
    } else {
      const datosParaCrear = {
        nombre: categoria.nombre,
        descripcion: categoria.descripcion,
        orden: categoria.orden,
        activa: categoria.activa
      };
      
      this.categoriasService.crearCategoria(datosParaCrear).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.swalService.success('Categoría creada', response.message);
            this.cargarCategorias();
            this.cerrarModal();
          } else {
            this.swalService.error('Error', response.message);
          }
        },
        error: (error) => {
          console.error('Error en creación:', error);
          this.swalService.error('Error', 'No se pudo crear la categoría.');
        }
      });
    }
  }

  // MODIFICAR MÉTODO DE ELIMINACIÓN
  eliminarCategoria(id: string, nombre: string): void {
    this.swalService.confirm(
      '¿Estás seguro?', 
      `Esta acción eliminará permanentemente la categoría "${nombre}". ¡Esta acción no se puede deshacer!`,
      'Sí, eliminar',
      'Cancelar'
    ).then((confirmed) => {
      if (confirmed) {
        this.categoriasService.eliminarCategoria(id).subscribe({
          next: (response: any) => {
            if (response.success) {
              this.swalService.success('Categoría eliminada', response.message);
              this.cargarCategorias();
            } else {
              this.swalService.error('Error', response.message);
            }
          },
          error: (error) => {
            console.error('Error al eliminar:', error);
            let mensaje = 'No se pudo eliminar la categoría.';
            if (error.error && error.error.message) {
              mensaje = error.error.message;
            }
            this.swalService.error('Error', mensaje);
          }
        });
      }
    });
  }

  inicializarCategorias(): void {
    this.swalService.confirm('Inicializar', '¿Deseas crear las categorías por defecto?').then((confirmed) => {
      if (confirmed) {
        this.categoriasService.inicializarCategorias().subscribe({
          next: (response: any) => {
            if (response.success) {
              this.swalService.success('Categorías inicializadas', response.message);
              this.cargarCategorias();
            } else {
              this.swalService.error('Error', response.message);
            }
          },
          error: (error) => {
            this.swalService.error('Error', 'No se pudieron inicializar las categorías.');
          }
        });
      }
    });
  }

  // Método para reactivar una categoría inactiva
  reactivarCategoria(id: string): void {
    this.swalService.confirm('Reactivar', '¿Deseas reactivar esta categoría?').then((confirmed) => {
      if (confirmed) {
        const datos = { activa: true };
        this.categoriasService.actualizarCategoria(id, datos).subscribe({
          next: (response: any) => {
            if (response.success) {
              this.swalService.success('Categoría reactivada', response.message);
              this.cargarCategorias();
            } else {
              this.swalService.error('Error', response.message);
            }
          },
          error: (error) => {
            this.swalService.error('Error', 'No se pudo reactivar la categoría.');
          }
        });
      }
    });
  }
}